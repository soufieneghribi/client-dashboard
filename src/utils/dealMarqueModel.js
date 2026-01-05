export class DealMarquesModel {
    constructor({
      id,
      clientId,
      marqueId,
      dealOffreId,
      segments,
      codeMarque,
      marqueLogo,
      marqueName,
      objectif1 = 0.0,
      objectif2 = 0.0,
      objectif3 = 0.0,
      objectif4 = 0.0,
      objectif5 = 0.0,
      gainObjectif1 = 0.0,
      gainObjectif2 = 0.0,
      gainObjectif3 = 0.0,
      gainObjectif4 = 0.0,
      gainObjectif5 = 0.0,
      compteurObjectif = 0.0,
      amountEarned = 0.0,
    }) {
      this.id = id;
      this.clientId = clientId;
      this.marqueId = marqueId;
      this.dealOffreId = dealOffreId;
      this.segments = segments;
      this.codeMarque = codeMarque;
      this.marqueLogo = marqueLogo;
      this.marqueName = marqueName;
      this.objectif1 = objectif1;
      this.objectif2 = objectif2;
      this.objectif3 = objectif3;
      this.objectif4 = objectif4;
      this.objectif5 = objectif5;
      this.gainObjectif1 = gainObjectif1;
      this.gainObjectif2 = gainObjectif2;
      this.gainObjectif3 = gainObjectif3;
      this.gainObjectif4 = gainObjectif4;
      this.gainObjectif5 = gainObjectif5;
      this.compteurObjectif = compteurObjectif;
      this.amountEarned = amountEarned;
    }
  
    static fromJson(json) {
      const parseDouble = (value) => {
        if (value == null) return 0.0;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') return parseFloat(value) || 0.0;
        return 0.0;
      };
  
      return new DealMarquesModel({
        id: json.ID_deal_marque,
        clientId: json.ID_client,
        marqueId: json.marque_id,
        dealOffreId: json.ID_deal_offre,
        segments: json.segments,
        codeMarque: json.code_marque,
        marqueLogo: json.marque?.image || '', // Using 'image' to match your DB schema
        marqueName: json.marque?.nom_marque || '',
        objectif1: parseDouble(json.objectif_1),
        objectif2: parseDouble(json.objectif_2),
        objectif3: parseDouble(json.objectif_3),
        objectif4: parseDouble(json.objectif_4),
        objectif5: parseDouble(json.objectif_5),
        gainObjectif1: parseDouble(json.gain_objectif_1),
        gainObjectif2: parseDouble(json.gain_objectif_2),
        gainObjectif3: parseDouble(json.gain_objectif_3),
        gainObjectif4: parseDouble(json.gain_objectif_4),
        gainObjectif5: parseDouble(json.gain_objectif_5),
        compteurObjectif: parseDouble(json.compteur_objectif),
        amountEarned: parseDouble(json.amount_earned),
      });
    }
  
    toJson() {
      return {
        ID_deal_marque: this.id,
        ID_client: this.clientId,
        marque_id: this.marqueId,
        ID_deal_offre: this.dealOffreId,
        segments: this.segments,
        code_marque: this.codeMarque,
        image: this.marqueLogo,
        objectif_1: this.objectif1,
        objectif_2: this.objectif2,
        objectif_3: this.objectif3,
        objectif_4: this.objectif4,
        objectif_5: this.objectif5,
        gain_objectif_1: this.gainObjectif1,
        gain_objectif_2: this.gainObjectif2,
        gain_objectif_3: this.gainObjectif3,
        gain_objectif_4: this.gainObjectif4,
        gain_objectif_5: this.gainObjectif5,
        compteur_objectif: this.compteurObjectif,
        amount_earned: this.amountEarned,
      };
    }
  }
  
