// modulo de ejemplo con validaciones de seguridad mejoradas

module.exports = {

    // logica que valida si un telefono esta correcto...
    is_valid_phone: function (phone) {
      // inicializacion lazy
      var isValid = false;
      // expresion regular copiada de StackOverflow
      var re = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i;
  
      // validacion Regex
      try {
        isValid = re.test(phone);
      } catch (e) {
        console.log(e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },

    // Función para sanitizar texto y prevenir inyecciones XSS
    sanitizeText: function(text) {
      if (!text || typeof text !== 'string') {
        return '';
      }
      
      // Lista de patrones maliciosos comunes
      var maliciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
        /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
        /<link\b[^<]*>/gi,
        /<meta\b[^<]*>/gi,
        /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /on\w+\s*=/gi, // Eventos como onclick, onload, etc.
        /expression\s*\(/gi,
        /url\s*\(/gi,
        /@import/gi,
        /eval\s*\(/gi,
        /setTimeout\s*\(/gi,
        /setInterval\s*\(/gi,
        /Function\s*\(/gi,
        /document\./gi,
        /window\./gi,
        /alert\s*\(/gi,
        /confirm\s*\(/gi,
        /prompt\s*\(/gi
      ];
      
      var sanitized = text;
      
      // Aplicar cada patrón malicioso
      maliciousPatterns.forEach(function(pattern) {
        sanitized = sanitized.replace(pattern, '');
      });
      
      // Escapar caracteres HTML especiales (sin escapar /)
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      return sanitized;
    },

    // Función para validar que una URL es segura y válida
    isValidSecureUrl: function(url) {
      if (!url || typeof url !== 'string') {
        return false;
      }
      
      // Patrones de URLs peligrosas
      var dangerousPatterns = [
        /javascript:/gi,
        /vbscript:/gi,
        /data:/gi,
        /file:/gi,
        /ftp:/gi,
        /mailto:/gi,
        /tel:/gi,
        /sms:/gi,
        /blob:/gi,
        /chrome-extension:/gi,
        /moz-extension:/gi,
        /safari-extension:/gi,
        /ms-browser-extension:/gi
      ];
      
      // Verificar patrones peligrosos
      for (var i = 0; i < dangerousPatterns.length; i++) {
        if (dangerousPatterns[i].test(url)) {
          return false;
        }
      }
      
      // Verificar que sea una URL HTTP/HTTPS válida
      var urlPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/;
      return urlPattern.test(url);
    },

    // Función para validar dominios permitidos (whitelist)
    isAllowedDomain: function(url) {
      if (!url || typeof url !== 'string') {
        return false;
      }
      
      // Lista de dominios permitidos para imágenes y videos
      var allowedDomains = [
        // YouTube
        'youtube.com',
        'youtu.be',
        
        // Imagenes populares
        'imgur.com',
        'i.imgur.com',
        'giphy.com',
        'media.giphy.com',
        'tenor.com',
        'media.tenor.com',
        'unsplash.com',
        'images.unsplash.com',
        'pixabay.com',
        'cdn.pixabay.com',
        'pexels.com',
        'images.pexels.com',
        'flickr.com',
        'staticflickr.com',
        'freesvg.org',
        'openclipart.org',
        'wikimedia.org',
        'commons.wikimedia.org',
        'deviantart.com',
        'deviantart.net',
        'artstation.com',
        'dribbble.com',
        
        // CDNs y almacenamiento
        'amazonaws.com',
        'cloudfront.net',
        'googleusercontent.com',
        'googleapis.com',
        'github.com',
        'githubusercontent.com',
        'raw.githubusercontent.com',
        'dropbox.com',
        'dropboxusercontent.com',
        'drive.google.com',
        'docs.google.com',
        'storage.googleapis.com',
        's3.amazonaws.com',
        'cdn.jsdelivr.net',
        'unpkg.com',
        
        // Redes sociales (solo para contenido público)
        'instagram.com',
        'cdninstagram.com',
        'twitter.com',
        'pbs.twimg.com',
        'twimg.com',
        
        // Otros sitios populares
        'reddit.com',
        'i.redd.it',
        'preview.redd.it',
        'vimeo.com',
        'player.vimeo.com',
        'dailymotion.com',
        'streamable.com',
        'gfycat.com',
        'thumbs.gfycat.com',
        'media.gfycat.com',
        
        // Sitios de noticias y contenido
        'bbc.com',
        'cdn.bbc.com',
        'cnn.com',
        'cdn.cnn.com',
        'nytimes.com',
        'static01.nyt.com',
        
        // Sitios educativos
        'wikipedia.org',
        'upload.wikimedia.org',
        'khanacademy.org',
        'cdn.kastatic.org'
      ];
      
      try {
        var urlObj = new URL(url);
        var hostname = urlObj.hostname.toLowerCase();
        
        // Verificar si el dominio está en la lista permitida
        for (var i = 0; i < allowedDomains.length; i++) {
          if (hostname === allowedDomains[i] || hostname.endsWith('.' + allowedDomains[i])) {
            return true;
          }
        }
        
        return false;
      } catch (e) {
        return false;
      }
    },

    is_valid_url_image: function (url) {
      // Validaciones de seguridad - solo verificar que sea una URL segura, no el dominio
      if (!this.isValidSecureUrl(url)) {
        return false;
      }
      
      // inicializacion lazy
      var isValid = false;
      // expresion regular mejorada para imagenes con validación estricta
      // Permite cualquier dominio para imágenes
      var re = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\/.*\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?[a-zA-Z0-9=&%-_]*)?$/i;
  
      // validacion Regex
      try {
        isValid = re.test(url);
      } catch (e) {
        console.log('Error validating image URL:', e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },
  
    is_valid_video_url: function (url) {
      // Validaciones de seguridad
      if (!this.isValidSecureUrl(url) || !this.isAllowedDomain(url)) {
        return false;
      }
      
      // inicializacion lazy
      var isValid = false;
      // expresion regular mejorada para videos con validación estricta
      var re = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}\/.*\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)(\?[a-zA-Z0-9=&%-_]*)?$/i;
  
      // validacion Regex
      try {
        isValid = re.test(url);
      } catch (e) {
        console.log('Error validating video URL:', e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },
  
    is_valid_yt_video: function (url) {
      // Validaciones de seguridad
      if (!this.isValidSecureUrl(url)) {
        return false;
      }
      
      // inicializacion lazy
      var isValid = false;
      // expresion regular mejorada para YouTube con validación estricta
      var re = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\?[a-zA-Z0-9=&%-_]*)?$/i;
  
      // validacion Regex
      try {
        isValid = re.test(url);
      } catch (e) {
        console.log('Error validating YouTube URL:', e);
      } finally {
          return isValid;
      }
      // fin del try-catch block
    },

    getYTVideoId: function(url){
      try {
        var match = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([a-zA-Z0-9_-]{11})/);
        if (match && match[1]) {
          return match[1];
        }
        return null;
      } catch (e) {
        console.log('Error extracting YouTube video ID:', e);
        return null;
      }
    },

    getEmbeddedCode: function (url){
      try {
        var id = this.getYTVideoId(url);
        if (id) {
          // No sanitizar el ID del video ya que es seguro
          var code = '<iframe width="100%" height="315" src="https://www.youtube.com/embed/'+id+ '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="max-width: 560px; border-radius: 8px;"></iframe>';
          return code;
        }
        return this.sanitizeText(url); // Return sanitized URL if extraction fails
      } catch (e) {
        console.log('Error generating embedded code:', e);
        return this.sanitizeText(url);
      }
    },

    getVideoTag: function(url){
      // No sanitizar la URL ya que ya fue validada
      var tag = '<video width="100%" height="315" controls style="max-width: 560px; border-radius: 8px;"><source src="'+url+'" type="video/mp4">Tu navegador no soporta el elemento video.</video>';
      return tag;
    },

    getImageTag: function(url){
      // No sanitizar la URL ya que ya fue validada
      var tag = '<img src="'+url+'" style="max-height: 400px;max-width: 400px; border-radius: 8px; cursor: pointer;" onclick="window.open(this.src, \'_blank\')" alt="Imagen compartida" loading="lazy">';
      return tag;
    },

    // Función para validar la longitud del mensaje
    isValidMessageLength: function(message) {
      if (!message || typeof message !== 'string') {
        return false;
      }
      
      // Límite de 2000 caracteres para mensajes
      return message.length <= 2000;
    },

    // Función para validar el nombre de usuario
    isValidUsername: function(username) {
      if (!username || typeof username !== 'string') {
        return false;
      }
      
      // Solo permitir caracteres alfanuméricos, espacios, guiones y guiones bajos
      var re = /^[a-zA-Z0-9\s_-]{1,50}$/;
      return re.test(username);
    },

    validateMessage: function(msg){
      // Handle invalid input
      if (!msg || typeof msg !== 'string') {
        return JSON.stringify({ mensaje: '', error: 'Mensaje inválido' });
      }

      try {
        var obj = JSON.parse(msg);
        
        // Validar estructura del objeto
        if (!obj || typeof obj !== 'object' || !obj.mensaje) {
          return JSON.stringify({ mensaje: '', error: 'Estructura de mensaje inválida' });
        }
        
        // Validar longitud del mensaje
        if (!this.isValidMessageLength(obj.mensaje)) {
          return JSON.stringify({ mensaje: 'Mensaje demasiado largo (máximo 2000 caracteres)', error: 'Mensaje demasiado largo' });
        }
        
        // Validar nombre de usuario si existe
        if (obj.nombre && !this.isValidUsername(obj.nombre)) {
          obj.nombre = 'Usuario';
        }
        
        // Verificar si es una URL de imagen válida y segura (ANTES de sanitizar)
        if(this.is_valid_url_image(obj.mensaje)){
          console.log("Es una imagen válida y segura!");
          obj.mensaje = this.getImageTag(obj.mensaje);
        }
        // Verificar si es un video de YouTube válido y seguro (ANTES de sanitizar)
        else if(this.is_valid_yt_video(obj.mensaje)){
          console.log("Es un video de YouTube válido y seguro!");
          obj.mensaje = this.getEmbeddedCode(obj.mensaje);
        }
        // Verificar si es un video directo válido y seguro (ANTES de sanitizar)
        else if(this.is_valid_video_url(obj.mensaje)){
          console.log("Es un video válido y seguro!");
          obj.mensaje = this.getVideoTag(obj.mensaje);
        }
        else{
          console.log("Es un texto normal - sanitizado");
          // Para texto normal, usar el mensaje sanitizado
          obj.mensaje = this.sanitizeText(obj.mensaje);
        }
        
        // Sanitizar el color si existe
        if (obj.color) {
          obj.color = this.sanitizeText(obj.color);
        }
        
        return JSON.stringify(obj);
      } catch (e) {
        console.log('Error processing message:', e);
        return JSON.stringify({ mensaje: 'Error al procesar el mensaje', error: 'Error de procesamiento' });
      }
    }

  // fin del modulo
  };
  