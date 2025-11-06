// libs/supabase-client.js
// Módulo para conectar con Supabase y manejar operaciones de base de datos

const { createClient } = require('@supabase/supabase-js');
const { keyVaultClient } = require('./azure-keyvault');

class SupabaseClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
    }

    /**
     * Inicializar conexión a Supabase usando Azure Key Vault
     */
    async initialize() {
        try {
            console.log('[Supabase] Inicializando conexión...');

            // Obtener TODOS los secretos desde Azure Key Vault
            console.log('[Supabase] Obteniendo secretos de Azure Key Vault...');
            
            const supabaseUrl = await keyVaultClient.getSecret('SUPABASE-URL');
            const supabaseAnonKey = await keyVaultClient.getSecret('SUPABASE-ANON-KEY');
            
            if (!supabaseUrl) {
                throw new Error('No se pudo obtener SUPABASE-URL de Azure Key Vault');
            }
            
            if (!supabaseAnonKey) {
                throw new Error('No se pudo obtener SUPABASE-ANON-KEY de Azure Key Vault');
            }

            console.log('[Supabase] Secretos obtenidos correctamente');
            console.log('[Supabase] URL:', supabaseUrl);

            // Crear cliente de Supabase usando secretos del Key Vault
            this.client = createClient(supabaseUrl, supabaseAnonKey);

            // Verificar conexión
            await this.testConnection();
            
            this.isConnected = true;
            console.log('[Supabase] Conexión establecida exitosamente');

        } catch (error) {
            this.connectionAttempts++;
            console.error('[Supabase] Error inicializando:', error.message);
            
            if (this.connectionAttempts < this.maxRetries) {
                console.log(`[Supabase] Reintentando conexión (${this.connectionAttempts}/${this.maxRetries})...`);
                setTimeout(() => this.initialize(), 2000);
            } else {
                throw new Error(`No se pudo conectar a Supabase después de ${this.maxRetries} intentos`);
            }
        }
    }

    /**
     * Parsear URL de PostgreSQL
     * @param {string} url - URL de PostgreSQL
     * @returns {Object} - Componentes de la URL
     */
    parsePostgresUrl(url) {
        try {
            // postgresql://postgres:password@db.projectid.supabase.co:5432/postgres
            const regex = /postgresql:\/\/postgres:(.+)@db\.(.+)\.supabase\.co:5432\/postgres/;
            const match = url.match(regex);
            
            if (!match) {
                throw new Error('Formato de URL de PostgreSQL inválido');
            }

            return {
                password: match[1],
                projectId: match[2]
            };
        } catch (error) {
            throw new Error(`Error parseando URL de PostgreSQL: ${error.message}`);
        }
    }

    /**
     * Verificar conexión a Supabase
     */
    async testConnection() {
        try {
            const { data, error } = await this.client
                .from('messages')
                .select('count')
                .limit(1);

            if (error && !error.message.includes('relation "messages" does not exist')) {
                throw new Error(error.message);
            }

            console.log('[Supabase] Test de conexión exitoso');
        } catch (error) {
            throw new Error(`Test de conexión falló: ${error.message}`);
        }
    }

    /**
     * Guardar mensaje en la base de datos
     * @param {Object} messageData - Datos del mensaje
     * @returns {Promise<Object>} - Mensaje guardado
     */
    async saveMessage(messageData) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const { data, error } = await this.client
                .from('messages')
                .insert([{
                    user_name: messageData.nombre || 'Anónimo',
                    message: messageData.mensaje || '',
                    color: messageData.color || '#000000',
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                throw new Error(error.message);
            }

            console.log('[Supabase] Mensaje guardado:', data[0].id);
            return data[0];

        } catch (error) {
            console.error('[Supabase] Error guardando mensaje:', error.message);
            throw error;
        }
    }

    /**
     * Obtener mensajes recientes
     * @param {number} limit - Número de mensajes a obtener
     * @returns {Promise<Array>} - Array de mensajes
     */
    async getRecentMessages(limit = 50) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const { data, error } = await this.client
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(error.message);
            }

            console.log(`[Supabase] ${data.length} mensajes obtenidos`);
            return data.reverse(); // Invertir para mostrar cronológicamente

        } catch (error) {
            console.error('[Supabase] Error obteniendo mensajes:', error.message);
            return []; // Retornar array vacío en caso de error
        }
    }

    /**
     * Guardar riesgo en la base de datos
     * @param {Object} riskData - Datos del riesgo
     * @returns {Promise<Object>} - Riesgo guardado
     */
    async saveRisk(riskData) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            // Calcular nivel basado en score (PostgreSQL calcula score automáticamente)
            const score = riskData.probabilidad * riskData.impacto;
            let nivel = 'low';
            
            if (score >= 15) {
                nivel = 'critical';
            } else if (score >= 8) {
                nivel = 'high';
            } else if (score >= 4) {
                nivel = 'medium';
            } else {
                nivel = 'low';
            }

            const { data, error } = await this.client
                .from('risks')
                .insert([{
                    nombre: riskData.nombre,
                    probabilidad: riskData.probabilidad,
                    impacto: riskData.impacto,
                    // NO insertar score - PostgreSQL lo calcula automáticamente
                    nivel: nivel,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) {
                throw new Error(error.message);
            }

            console.log('[Supabase] Riesgo guardado:', data[0].id, 'Score calculado:', data[0].score, 'Nivel:', nivel);
            return data[0];

        } catch (error) {
            console.error('[Supabase] Error guardando riesgo:', error.message);
            throw error;
        }
    }

    /**
     * Obtener riesgos ordenados por score
     * @param {number} limit - Número de riesgos a obtener
     * @returns {Promise<Array>} - Array de riesgos
     */
    async getRisks(limit = 100) {
        try {
            if (!this.isConnected) {
                await this.initialize();
            }

            const { data, error } = await this.client
                .from('risks')
                .select('*')
                .order('score', { ascending: false })
                .limit(limit);

            if (error) {
                throw new Error(error.message);
            }

            console.log(`[Supabase] ${data.length} riesgos obtenidos`);
            return data;

        } catch (error) {
            console.error('[Supabase] Error obteniendo riesgos:', error.message);
            return []; // Retornar array vacío en caso de error
        }
    }
}

// Crear instancia singleton
const supabaseClient = new SupabaseClient();

module.exports = {
    supabaseClient,
    SupabaseClient
};