import { supabase } from './client';

const BUCKET_NAME = 'products';

interface UploadResult {
  url: string;
  error?: Error;
}

/**
 * Service pour gérer les opérations de stockage avec Supabase
 */
export const storageService = {
  /**
   * Télécharger un fichier dans le bucket de stockage
   */
  async uploadFile(file: File, folder: string = ''): Promise<UploadResult> {
    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${Date.now()}_${randomId}.${fileExt}`;
      
      // Construire le chemin du fichier
      const filePath = folder 
        ? `${folder}/${fileName}`
        : fileName;
      
      // Télécharger le fichier dans le bucket
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Générer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
        
      return { url: publicUrl };
      
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier:', error);
      return { 
        url: '', 
        error: error instanceof Error ? error : new Error('Erreur inconnue lors du téléchargement') 
      };
    }
  },
  
  /**
   * Télécharger plusieurs fichiers en parallèle
   */
  async uploadMultipleFiles(files: File[], folder: string = ''): Promise<UploadResult[]> {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadFile(file, folder)
    );
    
    return Promise.all(uploadPromises);
  },
  
  /**
   * Supprimer un fichier du bucket de stockage
   */
  async deleteFile(url: string): Promise<{ success: boolean, error?: Error }> {
    try {
      console.log('Tentative de suppression du fichier:', url);
      
      // Si l'URL est vide ou invalide, terminer
      if (!url || !url.trim() || !url.includes('/')) {
        console.error('URL invalide:', url);
        return { success: false, error: new Error('URL invalide') };
      }
      
      // Méthode 1: Extraire directement à partir de la structure d'URL Supabase typique
      // Format: https://xxx.supabase.co/storage/v1/object/public/products/filename.jpg
      let path = '';
      
      try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        
        // Trouver les indices importants
        const publicIndex = pathParts.indexOf('public');
        const bucketIndex = pathParts.indexOf(BUCKET_NAME);
        
        if (publicIndex !== -1 && bucketIndex !== -1 && bucketIndex === publicIndex + 1) {
          // Format standard: tout ce qui vient après 'products/'
          path = pathParts.slice(bucketIndex + 1).join('/');
          console.log('Méthode 1 - Chemin extrait:', path);
        } else if (bucketIndex !== -1) {
          // Format alternatif: tout ce qui vient après 'products'
          path = pathParts.slice(bucketIndex + 1).join('/');
          console.log('Méthode 1 (alternatif) - Chemin extrait:', path);
        } else {
          // Dernier recours: prendre simplement le dernier segment
          path = pathParts[pathParts.length - 1];
          console.log('Méthode 1 (fallback) - Chemin extrait:', path);
        }
      } catch (error) {
        // Si la méthode 1 échoue, utiliser la méthode 2
        console.warn('Erreur lors de l\'analyse de l\'URL, utilisation de la méthode de secours');
        
        // Méthode 2: Extraction par regexp simple
        // Chercher le motif 'products/quelquechose'
        const match = url.match(new RegExp(`${BUCKET_NAME}\/(.*?)($|\?|#)`, 'i'));
        if (match && match[1]) {
          path = match[1];
          console.log('Méthode 2 - Chemin extrait:', path);
        } else {
          // Dernier recours: prendre simplement le dernier segment de l'URL
          const segments = url.split('/');
          path = segments[segments.length - 1].split('?')[0].split('#')[0];
          console.log('Méthode 2 (fallback) - Chemin extrait:', path);
        }
      }
      
      if (!path) {
        throw new Error('Impossible d\'extraire le chemin du fichier de l\'URL: ' + url);
      }
      
      console.log('Suppression du fichier:', path, 'dans le bucket:', BUCKET_NAME);
      
      // Supprimer le fichier
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([path]);
        
      if (error) throw error;
      
      return { success: true };
      
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Erreur inconnue lors de la suppression') 
      };
    }
  },
  
  /**
   * Remplacer un fichier existant par un nouveau
   */
  async replaceFile(oldUrl: string, newFile: File, folder: string = ''): Promise<UploadResult> {
    try {
      // Supprimer l'ancien fichier si une URL est fournie
      if (oldUrl) {
        await this.deleteFile(oldUrl);
      }
      
      // Télécharger le nouveau fichier
      return this.uploadFile(newFile, folder);
      
    } catch (error) {
      console.error('Erreur lors du remplacement du fichier:', error);
      return { 
        url: '', 
        error: error instanceof Error ? error : new Error('Erreur inconnue lors du remplacement') 
      };
    }
  }
};
