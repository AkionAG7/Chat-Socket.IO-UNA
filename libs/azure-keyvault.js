// libs/azure-keyvault.js
// Módulo para conectar con Azure Key Vault y obtener secretos

const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

class AzureKeyVaultClient {
    constructor() {
        // URL del Key Vault
        this.vaultUrl = 'https://chat-keyvault-robert2024.vault.azure.net/';
        
        // Credential para autenticación
        this.credential = new DefaultAzureCredential();
        
        // Cliente de secretos
        this.client = new SecretClient(this.vaultUrl, this.credential);
        
        // Cache de secretos para evitar múltiples llamadas
        this.secretsCache = new Map();
        this.cacheExpiry = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    }

    /**
     * Obtener un secreto del Key Vault con cache y timeout
     * @param {string} secretName - Nombre del secreto
     * @returns {Promise<string>} - Valor del secreto
     */
    async getSecret(secretName) {
        try {
            // Verificar cache
            if (this.isSecretCached(secretName)) {
                console.log(`[Azure KeyVault] Secreto '${secretName}' obtenido del cache`);
                return this.secretsCache.get(secretName);
            }

            console.log(`[Azure KeyVault] Obteniendo secreto '${secretName}' de Azure...`);
            
            // Crear promesa con timeout de 10 segundos
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout: Azure Key Vault no responde')), 10000);
            });
            
            const secretPromise = this.client.getSecret(secretName);
            
            // Obtener secreto con timeout
            const secret = await Promise.race([secretPromise, timeoutPromise]);
            
            if (!secret.value) {
                throw new Error(`Secreto '${secretName}' no tiene valor`);
            }

            // Guardar en cache
            this.secretsCache.set(secretName, secret.value);
            this.cacheExpiry.set(secretName, Date.now() + this.CACHE_DURATION);

            console.log(`[Azure KeyVault] Secreto '${secretName}' obtenido exitosamente`);
            return secret.value;

        } catch (error) {
            console.error(`[Azure KeyVault] Error obteniendo secreto '${secretName}':`, error.message);
            throw new Error(`No se pudo obtener el secreto '${secretName}' de Azure Key Vault: ${error.message}`);
        }
    }

    /**
     * Verificar si un secreto está en cache y no ha expirado
     * @param {string} secretName - Nombre del secreto
     * @returns {boolean} - True si está en cache y válido
     */
    isSecretCached(secretName) {
        if (!this.secretsCache.has(secretName)) {
            return false;
        }

        const expiry = this.cacheExpiry.get(secretName);
        if (Date.now() > expiry) {
            // Cache expirado, limpiar
            this.secretsCache.delete(secretName);
            this.cacheExpiry.delete(secretName);
            return false;
        }

        return true;
    }

    /**
     * Obtener múltiples secretos de una vez
     * @param {string[]} secretNames - Array de nombres de secretos
     * @returns {Promise<Object>} - Objeto con los secretos
     */
    async getSecrets(secretNames) {
        const secrets = {};
        const promises = secretNames.map(async (name) => {
            try {
                secrets[name] = await this.getSecret(name);
            } catch (error) {
                console.error(`[Azure KeyVault] Error obteniendo secreto '${name}':`, error.message);
                secrets[name] = null;
            }
        });

        await Promise.all(promises);
        return secrets;
    }

    /**
     * Limpiar cache de secretos
     */
    clearCache() {
        this.secretsCache.clear();
        this.cacheExpiry.clear();
        console.log('[Azure KeyVault] Cache limpiado');
    }

    /**
     * Verificar conectividad con Azure Key Vault
     * @returns {Promise<boolean>} - True si la conexión es exitosa
     */
    async testConnection() {
        try {
            // Intentar obtener propiedades del vault
            await this.client.getSecret('SUPABASE-DATABASE-URL');
            console.log('[Azure KeyVault] Conexión exitosa');
            return true;
        } catch (error) {
            console.error('[Azure KeyVault] Error de conexión:', error.message);
            return false;
        }
    }
}

// Crear instancia singleton
const keyVaultClient = new AzureKeyVaultClient();

module.exports = {
    keyVaultClient,
    AzureKeyVaultClient
};