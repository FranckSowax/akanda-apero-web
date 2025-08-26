import axios from 'axios';

const RAPID_API_KEY = 'c681296a52mshc2c73586baf893bp135671jsn76eb375db9e7';
const RAPID_API_HOST = 'the-cocktail-db3.p.rapidapi.com';

export class CocktailDBService {
  private api = axios.create({
    baseURL: `https://${RAPID_API_HOST}`,
    headers: {
      'X-RapidAPI-Key': RAPID_API_KEY,
      'X-RapidAPI-Host': RAPID_API_HOST,
    }
  });

  // Récupérer la liste des cocktails
  async getAllCocktails(): Promise<any> {
    try {
      const response = await this.api.get('/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des cocktails:', error);
      throw error;
    }
  }

  // Récupérer les détails d'un cocktail par ID
  async getCocktailById(id: string): Promise<any> {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du cocktail ${id}:`, error);
      throw error;
    }
  }

  // Rechercher des cocktails par ingrédient
  async searchByIngredient(ingredient: string): Promise<any> {
    try {
      const response = await this.api.get('/filter', {
        params: { i: ingredient }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche par ingrédient:', error);
      throw error;
    }
  }
}

export default new CocktailDBService();
