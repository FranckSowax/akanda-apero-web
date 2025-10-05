\# 🔧 Documentation API Backend \- Paiement PromoGabon

\#\# 📋 Table des matières  
1\. \[Endpoints API\](\#endpoints-api)  
2\. \[Format des Données\](\#format-des-données)  
3\. \[Exemples d'Intégration\](\#exemples-dintégration)  
4\. \[Gestion des Erreurs\](\#gestion-des-erreurs)  
5\. \[Codes de Statut\](\#codes-de-statut)  
6\. \[Sécurité et Validation\](\#sécurité-et-validation)

\---

\#\# 🌐 Endpoints API

\#\#\# Base URL  
\`\`\`  
https://dev.promogabon.ga/api/  
\`\`\`

\#\#\# 1\. Initiation de Paiement  
\*\*Endpoint\*\*: \`POST /pvit\_payment.php\`

\*\*Headers requis\*\*:  
\`\`\`http  
Content-Type: application/x-www-form-urlencoded  
Accept: application/json  
X-Requested-With: XMLHttpRequest  
\`\`\`

\*\*Body (form-data)\*\*:  
\`\`\`javascript  
{  
  // Données de la commande  
  "source\_type": "subscription",  
  "reference": "SUB\_17592439206",  
  "amount": 500,  
  "currency": "XOF",  
  "description": "Abonnement PromoGabon \- John Doe",  
    
  // Données client  
  "customer": {  
    "name": "John Doe",  
    "email": "john@example.com",  
    "phone": "076527007"  
  },  
    
  // Données de livraison  
  "delivery": {  
    "method": "digital",  
    "address": "N/A"  
  },  
    
  // Articles de la commande  
  "items": \[  
    {  
      "name": "Abonnement PromoGabon",  
      "price": 500,  
      "quantity": 1,  
      "description": "Accès complet aux services"  
    }  
  \],  
    
  // Méthode de paiement  
  "payment\_method": "mobile\_money",  
  "provider": "airtel\_money" // ou "moov\_money"  
}  
\`\`\`

\#\#\# 2\. Vérification du Statut  
\*\*Endpoint\*\*: \`GET /payment\_status\_check.php\`

\*\*Paramètres\*\*:  
\`\`\`http  
GET /payment\_status\_check.php?reference=SUB\_17592439206\&t=1759243920600  
\`\`\`

\*\*Headers\*\*:  
\`\`\`http  
Accept: application/json  
X-Requested-With: XMLHttpRequest  
\`\`\`

\---

\#\# 📊 Format des Données

\#\#\# 1\. Données d'Entrée (Initiation)

\#\#\#\# Structure Complète  
\`\`\`javascript  
const paymentData \= {  
  // Métadonnées de la commande  
  source\_type: "subscription",           // Type de source  
  reference: "SUB\_17592439206",          // Référence unique (max 15 caractères)  
  amount: 500,                           // Montant en FCFA  
  currency: "XOF",                       // Devise (XOF pour FCFA)  
  description: "Abonnement PromoGabon \- John Doe", // Description  
    
  // Informations client  
  customer: {  
    name: "John Doe",                    // Nom complet  
    email: "john@example.com",          // Email valide  
    phone: "076527007"                  // Numéro de téléphone (format gabonais)  
  },  
    
  // Informations de livraison  
  delivery: {  
    method: "digital",                   // Méthode de livraison  
    address: "N/A"                      // Adresse (N/A pour digital)  
  },  
    
  // Articles de la commande  
  items: \[  
    {  
      name: "Abonnement PromoGabon",     // Nom de l'article  
      price: 500,                        // Prix unitaire  
      quantity: 1,                       // Quantité  
      description: "Accès complet aux services" // Description  
    }  
  \],  
    
  // Configuration du paiement  
  payment\_method: "mobile\_money",        // Méthode de paiement  
  provider: "airtel\_money"              // Fournisseur (airtel\_money ou moov\_money)  
};  
\`\`\`

\#\#\#\# Validation des Champs  
\`\`\`javascript  
// Référence (obligatoire, max 15 caractères)  
const reference \= "SUB\_17592439206"; // ✅ Valide  
const reference \= "SUB\_17592439206000"; // ❌ Trop long (19 caractères)

// Montant (obligatoire, entier positif)  
const amount \= 500; // ✅ Valide  
const amount \= \-100; // ❌ Négatif  
const amount \= 0; // ❌ Zéro

// Email (obligatoire, format valide)  
const email \= "john@example.com"; // ✅ Valide  
const email \= "invalid-email"; // ❌ Format invalide

// Téléphone (obligatoire, format gabonais)  
const phone \= "076527007"; // ✅ Valide  
const phone \= "123456789"; // ❌ Format invalide  
\`\`\`

\#\#\# 2\. Données de Sortie (Réponses)

\#\#\#\# Réponse de Succès (Initiation)  
\`\`\`javascript  
{  
  "success": true,  
  "message": "Paiement initié avec succès",  
  "data": {  
    "reference": "SUB\_17592439206",  
    "status": "pending",  
    "amount": 500,  
    "phone": "076527007",  
    "payment\_method": "mobile\_money",  
    "provider": "airtel\_money",  
    "created\_at": "2025-01-30 14:06:23",  
    "order\_id": 95  
  }  
}  
\`\`\`

\#\#\#\# Réponse de Succès (Vérification)  
\`\`\`javascript  
{  
  "success": true,  
  "message": "Statut récupéré depuis la base de données",  
  "data": {  
    "reference": "SUB\_17592439206",  
    "status": "completed",              // Statut du paiement  
    "amount": 500,  
    "phone": "076527007",  
    "payment\_method": "mobile\_money",  
    "client\_name": "John Doe",  
    "client\_email": "john@example.com",  
    "redirect\_url": "?p=payment\_success", // URL de redirection  
    "created\_at": "2025-01-30 14:06:23",  
    "updated\_at": "2025-01-30 14:08:45",  
    "checked\_at": "2025-01-30 14:08:45",  
    "from\_database": true  
  },  
  "details\_paiement": {  
    // Détails supplémentaires du paiement  
  },  
  "order\_id": 95,  
  "reference\_commande": "CMD\_17592439206"  
}  
\`\`\`

\---

\#\# 🔧 Exemples d'Intégration

\#\#\# 1\. PHP (cURL)  
\`\`\`php  
\<?php  
function initierPaiement($donnees) {  
    $url \= 'https://dev.promogabon.ga/api/pvit\_payment.php';  
      
    $postData \= http\_build\_query(\[  
        'source\_type' \=\> 'subscription',  
        'reference' \=\> $donnees\['reference'\],  
        'amount' \=\> $donnees\['amount'\],  
        'currency' \=\> 'XOF',  
        'description' \=\> $donnees\['description'\],  
        'customer' \=\> json\_encode($donnees\['customer'\]),  
        'delivery' \=\> json\_encode($donnees\['delivery'\]),  
        'items' \=\> json\_encode($donnees\['items'\]),  
        'payment\_method' \=\> 'mobile\_money',  
        'provider' \=\> $donnees\['provider'\]  
    \]);  
      
    $ch \= curl\_init();  
    curl\_setopt($ch, CURLOPT\_URL, $url);  
    curl\_setopt($ch, CURLOPT\_POST, true);  
    curl\_setopt($ch, CURLOPT\_POSTFIELDS, $postData);  
    curl\_setopt($ch, CURLOPT\_RETURNTRANSFER, true);  
    curl\_setopt($ch, CURLOPT\_HTTPHEADER, \[  
        'Content-Type: application/x-www-form-urlencoded',  
        'Accept: application/json',  
        'X-Requested-With: XMLHttpRequest'  
    \]);  
      
    $response \= curl\_exec($ch);  
    $httpCode \= curl\_getinfo($ch, CURLINFO\_HTTP\_CODE);  
    curl\_close($ch);  
      
    return \[  
        'http\_code' \=\> $httpCode,  
        'response' \=\> json\_decode($response, true)  
    \];  
}

// Utilisation  
$donnees \= \[  
    'reference' \=\> 'SUB\_' . time(),  
    'amount' \=\> 500,  
    'description' \=\> 'Abonnement PromoGabon \- John Doe',  
    'customer' \=\> \[  
        'name' \=\> 'John Doe',  
        'email' \=\> 'john@example.com',  
        'phone' \=\> '076527007'  
    \],  
    'delivery' \=\> \[  
        'method' \=\> 'digital',  
        'address' \=\> 'N/A'  
    \],  
    'items' \=\> \[  
        \[  
            'name' \=\> 'Abonnement PromoGabon',  
            'price' \=\> 500,  
            'quantity' \=\> 1,  
            'description' \=\> 'Accès complet aux services'  
        \]  
    \],  
    'provider' \=\> 'airtel\_money'  
\];

$resultat \= initierPaiement($donnees);  
echo json\_encode($resultat);  
?\>  
\`\`\`

\#\#\# 2\. Node.js (fetch)  
\`\`\`javascript  
const initierPaiement \= async (donnees) \=\> {  
    const url \= 'https://dev.promogabon.ga/api/pvit\_payment.php';  
      
    const formData \= new URLSearchParams();  
    formData.append('source\_type', 'subscription');  
    formData.append('reference', donnees.reference);  
    formData.append('amount', donnees.amount);  
    formData.append('currency', 'XOF');  
    formData.append('description', donnees.description);  
    formData.append('customer', JSON.stringify(donnees.customer));  
    formData.append('delivery', JSON.stringify(donnees.delivery));  
    formData.append('items', JSON.stringify(donnees.items));  
    formData.append('payment\_method', 'mobile\_money');  
    formData.append('provider', donnees.provider);  
      
    try {  
        const response \= await fetch(url, {  
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/x-www-form-urlencoded',  
                'Accept': 'application/json',  
                'X-Requested-With': 'XMLHttpRequest'  
            },  
            body: formData  
        });  
          
        const result \= await response.json();  
          
        return {  
            http\_code: response.status,  
            response: result  
        };  
    } catch (error) {  
        return {  
            http\_code: 0,  
            response: { error: error.message }  
        };  
    }  
};

// Utilisation  
const donnees \= {  
    reference: 'SUB\_' \+ Date.now(),  
    amount: 500,  
    description: 'Abonnement PromoGabon \- John Doe',  
    customer: {  
        name: 'John Doe',  
        email: 'john@example.com',  
        phone: '076527007'  
    },  
    delivery: {  
        method: 'digital',  
        address: 'N/A'  
    },  
    items: \[  
        {  
            name: 'Abonnement PromoGabon',  
            price: 500,  
            quantity: 1,  
            description: 'Accès complet aux services'  
        }  
    \],  
    provider: 'airtel\_money'  
};

initierPaiement(donnees).then(resultat \=\> {  
    console.log(JSON.stringify(resultat, null, 2));  
});  
\`\`\`

\#\#\# 3\. Python (requests)  
\`\`\`python  
import requests  
import json

def initier\_paiement(donnees):  
    url \= 'https://dev.promogabon.ga/api/pvit\_payment.php'  
      
    data \= {  
        'source\_type': 'subscription',  
        'reference': donnees\['reference'\],  
        'amount': donnees\['amount'\],  
        'currency': 'XOF',  
        'description': donnees\['description'\],  
        'customer': json.dumps(donnees\['customer'\]),  
        'delivery': json.dumps(donnees\['delivery'\]),  
        'items': json.dumps(donnees\['items'\]),  
        'payment\_method': 'mobile\_money',  
        'provider': donnees\['provider'\]  
    }  
      
    headers \= {  
        'Content-Type': 'application/x-www-form-urlencoded',  
        'Accept': 'application/json',  
        'X-Requested-With': 'XMLHttpRequest'  
    }  
      
    try:  
        response \= requests.post(url, data=data, headers=headers)  
        return {  
            'http\_code': response.status\_code,  
            'response': response.json()  
        }  
    except Exception as e:  
        return {  
            'http\_code': 0,  
            'response': {'error': str(e)}  
        }

\# Utilisation  
donnees \= {  
    'reference': f'SUB\_{int(time.time())}',  
    'amount': 500,  
    'description': 'Abonnement PromoGabon \- John Doe',  
    'customer': {  
        'name': 'John Doe',  
        'email': 'john@example.com',  
        'phone': '076527007'  
    },  
    'delivery': {  
        'method': 'digital',  
        'address': 'N/A'  
    },  
    'items': \[  
        {  
            'name': 'Abonnement PromoGabon',  
            'price': 500,  
            'quantity': 1,  
            'description': 'Accès complet aux services'  
        }  
    \],  
    'provider': 'airtel\_money'  
}

resultat \= initier\_paiement(donnees)  
print(json.dumps(resultat, indent=2))  
\`\`\`

\#\#\# 4\. Vérification du Statut  
\`\`\`javascript  
// JavaScript/Node.js  
const verifierStatut \= async (reference) \=\> {  
    const url \= \`https://dev.promogabon.ga/api/payment\_status\_check.php?reference=${reference}\&t=${Date.now()}\`;  
      
    try {  
        const response \= await fetch(url, {  
            method: 'GET',  
            headers: {  
                'Accept': 'application/json',  
                'X-Requested-With': 'XMLHttpRequest'  
            }  
        });  
          
        const result \= await response.json();  
        return {  
            http\_code: response.status,  
            response: result  
        };  
    } catch (error) {  
        return {  
            http\_code: 0,  
            response: { error: error.message }  
        };  
    }  
};

// Utilisation  
verifierStatut('SUB\_17592439206').then(resultat \=\> {  
    console.log('Statut:', resultat.response.data.status);  
});  
\`\`\`

\---

\#\# ⚠️ Gestion des Erreurs

\#\#\# 1\. Codes d'Erreur HTTP

| Code | Description | Solution |  
|------|-------------|----------|  
| \*\*200\*\* | Succès | Traitement normal |  
| \*\*400\*\* | Bad Request | Vérifier les paramètres requis |  
| \*\*404\*\* | Not Found | Vérifier l'URL de l'API |  
| \*\*405\*\* | Method Not Allowed | Utiliser POST pour l'initiation |  
| \*\*500\*\* | Internal Server Error | Contacter le support |  
| \*\*503\*\* | Service Unavailable | Service temporairement indisponible |

\#\#\# 2\. Erreurs Spécifiques

\#\#\#\# Erreur de Validation (400)  
\`\`\`javascript  
{  
  "success": false,  
  "error": "La référence ne peut pas dépasser 15 caractères",  
  "message": "Référence invalide",  
  "data": {  
    "reference": "SUB\_17592439206000",  
    "max\_length": 15,  
    "current\_length": 19  
  }  
}  
\`\`\`

\#\#\#\# Erreur de Service (503)  
\`\`\`javascript  
{  
  "success": false,  
  "error": "Service de paiement temporairement indisponible",  
  "message": "Les clés de sécurité sont en cours de renouvellement",  
  "retry\_after": 300,  
  "error\_code": "PVIT\_KEY\_UNAVAILABLE",  
  "data": {  
    "order\_id": 95,  
    "reference": "SUB\_17592439206",  
    "status": "key\_error"  
  }  
}  
\`\`\`

\#\#\#\# Erreur de Connexion  
\`\`\`javascript  
{  
  "success": false,  
  "error": "Erreur de connexion",  
  "message": "Impossible de se connecter au service de paiement",  
  "error\_code": "CONNECTION\_ERROR"  
}  
\`\`\`

\#\#\# 3\. Gestion des Erreurs en Code

\`\`\`javascript  
// Gestion complète des erreurs  
const gererErreur \= (erreur) \=\> {  
    if (erreur.http\_code \=== 400\) {  
        // Erreur de validation  
        console.error('Erreur de validation:', erreur.response.message);  
        return 'Données invalides';  
    }  
      
    if (erreur.http\_code \=== 503\) {  
        // Service indisponible  
        if (erreur.response.error\_code \=== 'PVIT\_KEY\_UNAVAILABLE') {  
            console.error('Service temporairement indisponible');  
            return 'Service temporairement indisponible. Réessayez dans quelques minutes.';  
        }  
    }  
      
    if (erreur.http\_code \=== 0\) {  
        // Erreur de connexion  
        console.error('Erreur de connexion:', erreur.response.error);  
        return 'Problème de connexion. Vérifiez votre internet.';  
    }  
      
    // Erreur générale  
    console.error('Erreur inconnue:', erreur);  
    return 'Une erreur est survenue. Veuillez réessayer.';  
};  
\`\`\`

\---

\#\# 📊 Codes de Statut

\#\#\# 1\. Statuts de Paiement

| Statut | Description | Action |  
|--------|-------------|--------|  
| \*\*pending\*\* | En attente | Continuer la vérification |  
| \*\*processing\*\* | En cours de traitement | Attendre |  
| \*\*completed\*\* | Terminé avec succès | Rediriger vers succès |  
| \*\*success\*\* | Succès | Rediriger vers succès |  
| \*\*failed\*\* | Échec | Rediriger vers échec |  
| \*\*cancelled\*\* | Annulé | Rediriger vers échec |  
| \*\*expired\*\* | Expiré | Rediriger vers échec |  
| \*\*not\_found\*\* | Non trouvé | Erreur de référence |

\#\#\# 2\. Logique de Redirection

\`\`\`javascript  
const gererRedirection \= (statut) \=\> {  
    switch (statut) {  
        case 'completed':  
        case 'success':  
            return '?p=payment\_success';  
              
        case 'failed':  
        case 'cancelled':  
        case 'expired':  
            return '?p=payment\_failed';  
              
        case 'pending':  
        case 'processing':  
            return '?p=payment\_pending';  
              
        default:  
            return '?p=payment\_error';  
    }  
};  
\`\`\`

\---

\#\# 🔒 Sécurité et Validation

\#\#\# 1\. Validation des Données

\`\`\`javascript  
// Validation de la référence  
const validerReference \= (reference) \=\> {  
    if (\!reference || reference.length \> 15\) {  
        throw new Error('La référence ne peut pas dépasser 15 caractères');  
    }  
    return reference;  
};

// Validation du montant  
const validerMontant \= (montant) \=\> {  
    if (\!montant || montant \<= 0 || \!Number.isInteger(montant)) {  
        throw new Error('Le montant doit être un entier positif');  
    }  
    return montant;  
};

// Validation de l'email  
const validerEmail \= (email) \=\> {  
    const regex \= /^\[^\\s@\]+@\[^\\s@\]+\\.\[^\\s@\]+$/;  
    if (\!regex.test(email)) {  
        throw new Error('Format d\\'email invalide');  
    }  
    return email;  
};

// Validation du téléphone  
const validerTelephone \= (telephone) \=\> {  
    const regex \= /^0\[0-9\]{8}$/;  
    if (\!regex.test(telephone)) {  
        throw new Error('Format de téléphone invalide (ex: 076527007)');  
    }  
    return telephone;  
};  
\`\`\`

\#\#\# 2\. Sécurité des Requêtes

\`\`\`javascript  
// Headers de sécurité  
const headersSecurises \= {  
    'Content-Type': 'application/x-www-form-urlencoded',  
    'Accept': 'application/json',  
    'X-Requested-With': 'XMLHttpRequest',  
    'User-Agent': 'PromoGabon-Payment-Client/1.0'  
};

// Validation des réponses  
const validerReponse \= (reponse) \=\> {  
    if (\!reponse || typeof reponse \!== 'object') {  
        throw new Error('Réponse invalide du serveur');  
    }  
      
    if (reponse.success \=== false) {  
        throw new Error(reponse.message || 'Erreur du serveur');  
    }  
      
    return reponse;  
};  
\`\`\`

\#\#\# 3\. Gestion des Timeouts

\`\`\`javascript  
// Configuration des timeouts  
const configTimeout \= {  
    initiation: 30000,    // 30 secondes pour l'initiation  
    verification: 10000,   // 10 secondes pour la vérification  
    retry: 2000           // 2 secondes entre les retry  
};

// Implémentation du timeout  
const requeteAvecTimeout \= async (url, options, timeout \= 30000\) \=\> {  
    const controller \= new AbortController();  
    const timeoutId \= setTimeout(() \=\> controller.abort(), timeout);  
      
    try {  
        const response \= await fetch(url, {  
            ...options,  
            signal: controller.signal  
        });  
        clearTimeout(timeoutId);  
        return response;  
    } catch (error) {  
        clearTimeout(timeoutId);  
        if (error.name \=== 'AbortError') {  
            throw new Error('Timeout de la requête');  
        }  
        throw error;  
    }  
};  
\`\`\`

\---

\#\# 📚 Exemples Complets

\#\#\# 1\. Intégration E-commerce  
\`\`\`javascript  
// Fonction complète pour un e-commerce  
const traiterPaiementEcommerce \= async (commande) \=\> {  
    try {  
        // Validation des données  
        const donneesValidees \= {  
            reference: validerReference(commande.reference),  
            amount: validerMontant(commande.total),  
            description: \`Commande e-commerce \- ${commande.items.length} articles\`,  
            customer: {  
                name: commande.client.nom,  
                email: validerEmail(commande.client.email),  
                phone: validerTelephone(commande.client.telephone)  
            },  
            delivery: {  
                method: 'physical',  
                address: commande.adresse  
            },  
            items: commande.items.map(item \=\> ({  
                name: item.nom,  
                price: item.prix,  
                quantity: item.quantite,  
                description: item.description  
            })),  
            provider: commande.provider || 'airtel\_money'  
        };  
          
        // Initiation du paiement  
        const resultat \= await initierPaiement(donneesValidees);  
          
        if (resultat.http\_code \=== 200\) {  
            // Paiement initié avec succès  
            return {  
                success: true,  
                reference: resultat.response.data.reference,  
                status: resultat.response.data.status  
            };  
        } else {  
            // Erreur lors de l'initiation  
            throw new Error(gererErreur(resultat));  
        }  
          
    } catch (error) {  
        console.error('Erreur lors du traitement du paiement:', error);  
        return {  
            success: false,  
            error: error.message  
        };  
    }  
};  
\`\`\`

\#\#\# 2\. Vérification Automatique  
\`\`\`javascript  
// Vérification automatique du statut  
const verifierStatutAutomatique \= async (reference, maxTentatives \= 12\) \=\> {  
    let tentatives \= 0;  
      
    while (tentatives \< maxTentatives) {  
        try {  
            const resultat \= await verifierStatut(reference);  
              
            if (resultat.http\_code \=== 200\) {  
                const statut \= resultat.response.data.status;  
                  
                // Statut définitif  
                if (\['completed', 'success', 'failed', 'cancelled', 'expired'\].includes(statut)) {  
                    return {  
                        success: true,  
                        status: statut,  
                        data: resultat.response.data  
                    };  
                }  
                  
                // Statut encore en attente  
                console.log(\`Statut: ${statut} \- Tentative ${tentatives \+ 1}/${maxTentatives}\`);  
            }  
              
        } catch (error) {  
            console.error(\`Erreur tentative ${tentatives \+ 1}:\`, error);  
        }  
          
        tentatives++;  
          
        // Attendre 2 secondes avant la prochaine tentative  
        await new Promise(resolve \=\> setTimeout(resolve, 2000));  
    }  
      
    // Timeout atteint  
    return {  
        success: false,  
        error: 'Timeout de vérification atteint'  
    };  
};  
\`\`\`

\---

\#\# 🆘 Support Technique

\#\#\# Contact  
\- 📧 \*\*Email\*\*: support@promogabon.ga  
\- 📱 \*\*WhatsApp\*\*: \+241 XX XX XX XX  
\- 🌐 \*\*Site\*\*: https://promogabon.ga

\#\#\# Ressources  
\- 📚 \*\*Documentation complète\*\*: \[Lien vers la doc\]  
\- 🎥 \*\*Vidéos tuto\*\*: \[Lien vers les vidéos\]  
\- 💬 \*\*Forum\*\*: \[Lien vers le forum\]

\---

\*\*🎯 Cette documentation vous donne tous les éléments nécessaires pour intégrer l'API de paiement PromoGabon dans votre application existante \!\*\*

