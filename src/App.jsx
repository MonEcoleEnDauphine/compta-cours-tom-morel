import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, 
  AlertTriangle, Building, Calendar, PieChart, Lock, FileText, 
  Download, Trash2, XCircle, Search, ChevronRight, CheckCircle2, 
  Paperclip, Plus, Sparkles, Receipt, Heart, FileSpreadsheet, 
  Package, Target, TrendingUp, Info, Euro, ChevronDown, 
  Globe, Mail, Phone
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, getDoc, updateDoc } from "firebase/firestore";
import * as XLSX from 'xlsx';

// Configuration Firebase Officielle
const firebaseConfig = {
  apiKey: "AIzaSyDhKe4Nl3mUHagW1LkG5GT-tI1bB2-wtnE",
  authDomain: "cours-tom-morel.firebaseapp.com",
  projectId: "cours-tom-morel",
  storageBucket: "cours-tom-morel.firebasestorage.app",
  messagingSenderId: "605446922070",
  appId: "1:605446922070:web:7d81aca59101d76c5a00f7",
  measurementId: "G-XL0L5MG9LK"
};

// Initialisation conditionnelle
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "cours-tom-morel-erp";

const LOGO_URL = 'https://lh3.googleusercontent.com/sitesv/AG8ngQXc96dCEFn_IAzMJapefM9CVcMYjacEj4SRG34_lJVisC1M2RC4JkeFV2b8VN30TwAnTJN-HEkeXqfMpIH6JEChx3G9H1CUQ1SZDm-NSmFVdlj6GrkzkC3KCDkK_StXgHclve-6ytuuMw4fYkWcKQqjzjQzYeMm3ScP0VIQbBepycX8NGq429QMYo05=w16383';

// ==========================================
// COMPOSANTS DE PAGES (Placeholders & Réels)
// ==========================================

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    <p className="text-slate-500">Cette page est en cours de construction. Le module sera bientôt disponible.</p>
  </div>
);

// --- 1. INFOS & CONTACT ---
const InfosContact = () => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="bg-blue-600 p-8 rounded-xl shadow-md text-white">
      <h1 className="text-3xl font-bold mb-2">Bienvenue sur le portail du Cours Tom Morel</h1>
      <p className="text-blue-100">Retrouvez ici toutes les informations de scolarité et les plannings.</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Carte 1 : L'École (Site) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
          <Globe size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Le Cours Tom Morel</h3>
        <p className="text-blue-500 text-sm mb-6">24 rue de la Chapelle, Saint-Chef</p>
        
        <div className="flex-1"></div>
        
        <a href="https://sites.google.com/view/courstommorel/cours-tom-morel" target="_blank" rel="noreferrer" className="w-full inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">
          <Globe size={18} /> Visiter le site
        </a>
      </div>

      {/* Carte 2 : Direction */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
          <Mail size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Direction de l'École</h3>
        <p className="text-slate-600 text-sm font-medium mb-1">Mme Laurence Gérard</p>
        <p className="text-slate-400 text-xs mb-5">Équipe enseignante: Mme Cécile Sublet & Mme Florence</p>
        
        <div className="w-full border border-slate-200 rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-slate-600 text-sm font-medium">
          <Phone size={16} /> 06 67 90 95 76
        </div>
        
        <a href="mailto:direction@courstommorel.fr" className="w-full inline-flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">
          <Mail size={18} /> Écrire
        </a>
      </div>

      {/* Carte 3 : Association */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
          <Building size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Association (Bureau)</h3>
        <p className="text-purple-500 text-sm mb-6">Mon École en Dauphiné</p>
        
        <div className="flex-1"></div>
        
        <div className="w-full border border-slate-200 rounded-lg py-2 mb-3 flex items-center justify-center gap-2 text-slate-600 text-sm font-medium">
          <Phone size={16} /> 06 60 20 29 80
        </div>
        
        <a href="mailto:association@courstommorel.fr" className="w-full inline-flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-600 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm">
          <Mail size={18} /> Écrire
        </a>
      </div>

    </div>
  </div>
);

// --- 2. ÉTAT FINANCIER (Bilan & Résultat Groupés) ---
const EtatFinancier = ({ transactionsGlobales }) => {
  const [anneeDebut, setAnneeDebut] = useState(new Date().getFullYear() > 2025 ? 2025 : 2021);
  const [detailsOuverts, setDetailsOuverts] = useState({});

  const periode = useMemo(() => {
    return {
      debut: `${anneeDebut}-09-01`,
      fin: `${anneeDebut + 1}-08-31`,
      label: `01/09/${String(anneeDebut).slice(-2)} au 31/08/${String(anneeDebut + 1).slice(-2)}`
    };
  }, [anneeDebut]);

  const toggleDetail = (categorie) => {
    setDetailsOuverts(prev => ({ ...prev, [categorie]: !prev[categorie] }));
  };

  const nommerCompte = (compteId) => {
    const categories = {
      '1': '1 - Capitaux propres et emprunts',
      '2': '2 - Immobilisations',
      '3': '3 - Stocks',
      '4': '4 - Comptes de tiers (Clients/Fournisseurs)',
      '5': '5 - Comptes financiers (Banque/Caisse)',
      '60': '60 - Achats et variations de stocks',
      '61': '61 - Services extérieurs',
      '62': '62 - Autres services extérieurs',
      '63': '63 - Impôts et taxes',
      '64': '64 - Charges de personnel',
      '65': '65 - Autres charges de gestion',
      '66': '66 - Charges financières',
      '67': '67 - Charges exceptionnelles',
      '68': '68 - Dotations aux amortissements',
      '70': '70 - Ventes et prestations (Scolarité)',
      '74': '74 - Subventions',
      '75': '75 - Autres produits de gestion (Dons)',
      '76': '76 - Produits financiers',
      '77': '77 - Produits exceptionnels',
    };
    
    if (!compteId) return 'Non catégorisé';
    const prefix2 = compteId.substring(0, 2);
    const prefix1 = compteId.substring(0, 1);
    return categories[prefix2] || categories[prefix1] || 'Autres comptes';
  };

  const analyse = useMemo(() => {
    const txFiltrees = transactionsGlobales.filter(t => t.date >= periode.debut && t.date <= periode.fin);
    
    let parCompte = {};
    let soldeBanque = 0;

    // Calculs de base
    txFiltrees.forEach(t => {
      if (t.type === 'od') {
        if (t.compteDebit) {
          if (!parCompte[t.compteDebit]) parCompte[t.compteDebit] = 0;
          parCompte[t.compteDebit] -= Math.abs(t.montant); 
        }
        if (t.compteCredit) {
          if (!parCompte[t.compteCredit]) parCompte[t.compteCredit] = 0;
          parCompte[t.compteCredit] += Math.abs(t.montant); 
        }
      } else {
        soldeBanque += (t.montant || 0);
        if (t.compte) {
          if (!parCompte[t.compte]) parCompte[t.compte] = 0;
          parCompte[t.compte] -= t.montant; 
        }
      }
    });

    // On intègre la banque 512000 si y'a eu des mouvements
    if (soldeBanque !== 0) {
      if (!parCompte['512000']) parCompte['512000'] = 0;
      parCompte['512000'] += soldeBanque; 
    }

    let charges = {};
    let produits = {};
    let actif = {};
    let passif = {};
    let totalCharges = 0;
    let totalProduits = 0;

    Object.entries(parCompte).forEach(([compte, solde]) => {
      if (solde === 0) return;
      const categorie = nommerCompte(compte);
      const prefix = compte.charAt(0);
      const valeur = Math.abs(solde);

      if (['6'].includes(prefix)) {
        if (!charges[categorie]) charges[categorie] = { total: 0, comptes: [] };
        charges[categorie].comptes.push({ compte, solde: valeur });
        charges[categorie].total += valeur;
        totalCharges += valeur;
      } else if (['7'].includes(prefix)) {
        if (!produits[categorie]) produits[categorie] = { total: 0, comptes: [] };
        produits[categorie].comptes.push({ compte, solde: valeur });
        produits[categorie].total += valeur;
        totalProduits += valeur;
      } else if (['1', '2', '3', '4', '5'].includes(prefix)) {
        if (['2', '3'].includes(prefix) || (prefix === '5' && solde > 0) || (prefix === '4' && solde > 0)) {
          if (!actif[categorie]) actif[categorie] = { total: 0, comptes: [] };
          actif[categorie].comptes.push({ compte, solde: valeur });
          actif[categorie].total += valeur;
        } else {
          if (!passif[categorie]) passif[categorie] = { total: 0, comptes: [] };
          passif[categorie].comptes.push({ compte, solde: valeur });
          passif[categorie].total += valeur;
        }
      }
    });

    const resultat = totalProduits - totalCharges;

    return { charges, produits, actif, passif, totalCharges, totalProduits, resultat };
  }, [transactionsGlobales, periode]);

  const RenderTableauGroupé = ({ data, bgColor, textColor, title }) => (
    <div className="w-full">
      <div className={`p-3 font-bold text-center border-b ${bgColor} ${textColor}`}>{title}</div>
      <div className="p-0">
        {Object.keys(data).length === 0 ? (
          <div className="p-4 text-center text-sm text-slate-400">Aucune donnée</div>
        ) : (
          Object.entries(data).sort().map(([categorie, obj]) => (
            <div key={categorie} className="border-b border-slate-100 last:border-0">
              <div 
                className="flex justify-between items-center p-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => toggleDetail(categorie)}
              >
                <div className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                  <ChevronDown size={16} className={`transition-transform ${detailsOuverts[categorie] ? 'rotate-180' : ''}`} />
                  {categorie}
                </div>
                <div className="font-bold text-slate-800">{obj.total.toFixed(2)} €</div>
              </div>
              
              {detailsOuverts[categorie] && (
                <div className="bg-white p-2">
                  {obj.comptes.map((c, i) => (
                    <div key={i} className="flex justify-between py-1.5 px-6 text-sm border-b border-slate-50 last:border-0">
                      <div className="text-slate-600 flex items-center gap-2">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-mono">{c.compte}</span>
                      </div>
                      <div className="text-slate-700">{c.solde.toFixed(2)} €</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-indigo-600" /> États Financiers
          </h2>
          <p className="text-slate-500 text-sm mt-1">Bilan et Compte de Résultat groupés par familles comptables.</p>
        </div>
        <div className="flex gap-4 items-center">
          <select 
            value={anneeDebut}
            onChange={(e) => setAnneeDebut(Number(e.target.value))}
            className="border-slate-300 rounded-lg text-sm bg-slate-50 px-4 py-2"
          >
            {[2021, 2022, 2023, 2024, 2025, 2026].map(annee => (
              <option key={annee} value={annee}>01/09/{String(annee).slice(-2)} au 31/08/{String(annee+1).slice(-2)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* COMPTE DE RÉSULTAT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white p-4">
          <h3 className="font-bold text-lg flex items-center gap-2">Compte de Résultat (Classe 6 & 7)</h3>
          <p className="text-slate-300 text-xs">Film de l'année : Compare les produits et les charges pour déterminer le bénéfice ou la perte.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          <RenderTableauGroupé data={analyse.charges} bgColor="bg-red-50" textColor="text-red-700" title="CHARGES (Dépenses)" />
          <RenderTableauGroupé data={analyse.produits} bgColor="bg-emerald-50" textColor="text-emerald-700" title="PRODUITS (Recettes)" />
        </div>
        
        <div className="bg-slate-100 p-4 flex justify-between items-center border-t border-slate-200">
          <div className="font-bold text-slate-700">RÉSULTAT DE L'EXERCICE</div>
          <div className={`text-xl font-bold ${analyse.resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {analyse.resultat > 0 ? '+' : ''}{analyse.resultat.toFixed(2)} €
          </div>
        </div>
      </div>

      {/* BILAN */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 text-white p-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><Building size={20}/> Bilan Comptable (Classe 1 à 5)</h3>
          <p className="text-slate-300 text-xs">Photographie du patrimoine : L'Actif (ce qu'on possède) et le Passif (ce qu'on doit).</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          <RenderTableauGroupé data={analyse.actif} bgColor="bg-blue-50" textColor="text-blue-700" title="ACTIF (Emplois)" />
          <RenderTableauGroupé data={analyse.passif} bgColor="bg-orange-50" textColor="text-orange-700" title="PASSIF (Ressources)" />
        </div>
      </div>
    </div>
  );
};
// --- 3. GRAND LIVRE (Import CSV/XLSX, OD, Validations) ---
const GrandLivre = ({ transactionsGlobales }) => {
  const [lignesEnAttente, setLignesEnAttente] = useState([]);
  const [odForm, setOdForm] = useState({ date: '', libelle: '', debit: '', credit: '', montant: '' });
  const [comptesList, setComptesList] = useState([]);
  
  const fileInputCsvRef = useRef(null);
  const fileInputXlsxRef = useRef(null);
  const fileInputPaieRef = useRef(null);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      liste.sort((a, b) => a.code.localeCompare(b.code));
      setComptesList(liste);
    });
    return () => unsubscribe();
  }, []);

  // --- MOTEUR D'ASSISTANCE (IA LOCALE & MÉMOIRE) ---
  const devinerCompte = (libelleTxt) => {
    if (!libelleTxt) return '';
    const txt = libelleTxt.toLowerCase();

    // 1. Cherche dans la base validée
    const memoire = transactionsGlobales.find(tx => 
      tx.compte && tx.type !== 'od' && tx.libelle && (txt.includes(tx.libelle.toLowerCase()) || tx.libelle.toLowerCase().includes(txt))
    );
    if (memoire) return memoire.compte;

    // 2. Mots-clés standards
    const dictionnaire = [
      { mots: ['edf', 'engie', 'eau', 'electricite', 'saur'], compte: '606100' }, 
      { mots: ['loyer', 'sci '], compte: '613200' }, 
      { mots: ['orange', 'sfr', 'bouygues', 'free', 'telephone', 'internet', 'ovh', 'vercel'], compte: '626000' }, 
      { mots: ['banque', 'agios', 'cotisation', 'commission', 'frais bancaires', 'credit agricole', 'caisse epargne'], compte: '627000' }, 
      { mots: ['assurance', 'macif', 'axa', 'maaf', 'mgen'], compte: '616000' }, 
      { mots: ['dgfip', 'impot', 'urssaf', 'tresor public'], compte: '635000' }, 
      { mots: ['salaire', 'virement salaire', 'paie'], compte: '421000' }, 
      { mots: ['fourniture', 'bureau vallée', 'fnac', 'amazon', 'papeterie', 'leclerc', 'carrefour'], compte: '606400' }, 
      { mots: ['nettoyage', 'menage', 'entretien'], compte: '611000' }, 
      { mots: ['scolarite', 'frais de scolarite', 'ecolage', 'famille', 'inscription'], compte: '706000' }, 
      { mots: ['don ', 'helloasso', 'mecenat'], compte: '754000' }, 
    ];

    for (let regle of dictionnaire) {
      if (regle.mots.some(mot => txt.includes(mot))) {
        return regle.compte;
      }
    }
    return '';
  };

  // Mise à jour magique du SAS quand une écriture est validée
  useEffect(() => {
    if (lignesEnAttente.length > 0) {
      setLignesEnAttente(prev => prev.map(ligne => {
        if (!ligne.comptePropose) {
          const guess = devinerCompte(ligne.libelle);
          if (guess) return { ...ligne, comptePropose: guess };
        }
        return ligne;
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionsGlobales]);

  const handleImportFile = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const preparerLignes = (lignesBrutes) => {
      const nouvellesLignes = [];
      for (let i = 0; i < lignesBrutes.length; i++) {
        const cols = lignesBrutes[i];
        if (cols.length >= 7) {
          const debit = parseFloat(String(cols[5]).replace(',', '.')) || 0;
          const credit = parseFloat(String(cols[6]).replace(',', '.')) || 0;
          const mt = credit > 0 ? credit : -debit;
          const libelleExtrait = cols[1] || cols[3];
          
          if (mt !== 0) {
            nouvellesLignes.push({
              id: Math.random().toString(36).substr(2, 9),
              date: cols[0],
              libelle: libelleExtrait,
              reference: cols[2],
              typeOp: cols[4],
              montant: mt,
              comptePropose: devinerCompte(libelleExtrait),
              statut: 'attente'
            });
          }
        }
      }
      return nouvellesLignes;
    };

    if (type === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split('\n');
        const lignesBrutes = lines.slice(1).map(line => line.split(';').map(c => c.trim().replace(/"/g, '')));
        const resultat = preparerLignes(lignesBrutes);
        setLignesEnAttente(prev => [...prev, ...resultat]);
      };
      reader.readAsText(file, 'ISO-8859-1');
    } else if (type === 'xlsx') {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
        const resultat = preparerLignes(rows.slice(1));
        setLignesEnAttente(prev => [...prev, ...resultat]);
      } catch (err) {
        alert("Erreur lors de la lecture du fichier XLSX.");
      }
    }
  };

  const handleImportPaie = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const lines = event.target.result.split('\n');
      let count = 0;
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split('\t');
        if (cols.length >= 13) {
          const rawDate = cols[3].trim();
          const formattedDate = rawDate.length === 8 ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}` : rawDate;
          const compteNum = cols[4].trim();
          const compteLib = cols[5].trim();
          const pieceRef = cols[8].trim();
          const ecritureLib = cols[10].trim();
          const debit = parseFloat(cols[11].replace(',', '.')) || 0;
          const credit = parseFloat(cols[12].replace(',', '.')) || 0;
          
          if (debit > 0 || credit > 0) {
            const newTx = {
              date: formattedDate,
              libelle: `(PAIE) ${ecritureLib} - ${compteLib}`,
              montant: debit > 0 ? debit : credit,
              type: 'od',
              compteDebit: debit > 0 ? compteNum : '',
              compteCredit: credit > 0 ? compteNum : '',
              reference: pieceRef,
              date_creation: new Date().toISOString()
            };
            
            try {
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
              count++;
            } catch(err) {
              console.error(err);
            }
          }
        }
      }
      alert(`${count} lignes de paie intégrées directement au Grand Livre !`);
      if (fileInputPaieRef.current) fileInputPaieRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const validerLigneBank = async (ligneId, compteCode) => {
    const ligne = lignesEnAttente.find(l => l.id === ligneId);
    if (!ligne || !compteCode) return;
    
    const newTx = {
      date: ligne.date,
      libelle: ligne.libelle,
      montant: ligne.montant,
      compte: compteCode,
      reference: ligne.reference || '',
      typeOp: ligne.typeOp || '',
      type: ligne.montant < 0 ? 'depense' : 'recette',
      date_creation: new Date().toISOString()
    };
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
      setLignesEnAttente(prev => prev.filter(l => l.id !== ligneId));
    } catch(e) {
      alert("Erreur de sauvegarde.");
    }
  };

  const handleAddOD = async () => {
    if (!odForm.date || !odForm.libelle || !odForm.debit || !odForm.credit || !odForm.montant) {
      alert('Veuillez remplir tous les champs de l\'OD.');
      return;
    }
    const newTx = {
      date: odForm.date,
      libelle: `(OD) ${odForm.libelle}`,
      montant: parseFloat(odForm.montant.replace(',', '.')),
      type: 'od',
      compteDebit: odForm.debit,
      compteCredit: odForm.credit,
      date_creation: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
      setOdForm({ date: '', libelle: '', debit: '', credit: '', montant: '' });
      alert("OD ajoutée avec succès au Grand Livre.");
    } catch(e) {
      alert("Erreur lors de la création de l'OD.");
    }
  };

  const handleDeleteValidated = async (txId) => {
    if (window.confirm("ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement cette écriture du Grand Livre ?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId));
      } catch(e) { 
        alert('Erreur lors de la suppression.'); 
      }
    }
  };

  const handleUpdateCompte = async (txId, newCompte, field) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId), {
        [field]: newCompte
      });
    } catch(e) {
      alert("Erreur lors de la mise à jour du compte.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Grand Livre (Import & Saisie)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Importez vos relevés bancaires, fiches de paie ou saisissez une OD.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BLOC 1 : IMPORT BANQUE */}
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex flex-col justify-center items-center text-center space-y-4">
          <h3 className="font-bold text-indigo-900 text-lg">Journal de Banque</h3>
          <p className="text-sm text-indigo-700">Importez vos lignes bancaires pour les imputer.</p>
          <div className="flex flex-col gap-2 w-full">
            <input type="file" accept=".csv" className="hidden" ref={fileInputCsvRef} onChange={(e) => handleImportFile(e, 'csv')} />
            <button onClick={() => fileInputCsvRef.current.click()} className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
              <Download size={16} /> Import Relevé (.csv)
            </button>
            <input type="file" accept=".xlsx" className="hidden" ref={fileInputXlsxRef} onChange={(e) => handleImportFile(e, 'xlsx')} />
            <button onClick={() => fileInputXlsxRef.current.click()} className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
              <FileSpreadsheet size={16} /> Import Relevé (.xlsx)
            </button>
          </div>
        </div>

        {/* BLOC 2 : IMPORT PAIE */}
        <div className="bg-pink-50 p-6 rounded-xl border border-pink-200 flex flex-col justify-center items-center text-center space-y-4">
          <h3 className="font-bold text-pink-900 text-lg">Fiches de Paie</h3>
          <p className="text-sm text-pink-700">Importez le fichier TXT exporté depuis le logiciel de paie.</p>
          <div className="flex-1"></div>
          <input type="file" accept=".txt,.tsv" className="hidden" ref={fileInputPaieRef} onChange={handleImportPaie} />
          <button onClick={() => fileInputPaieRef.current.click()} className="w-full justify-center bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
            <Users size={16} /> Importer Fichier (.txt)
          </button>
        </div>

        {/* BLOC 3 : SAISIE OD */}
        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 space-y-4 flex flex-col">
          <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2 justify-center">
            <FileText size={18} /> Opération Diverse
          </h3>
          <div className="grid grid-cols-2 gap-2 flex-1">
            <input type="date" value={odForm.date} onChange={e => setOdForm({...odForm, date: e.target.value})} className="border border-purple-200 rounded p-1.5 text-xs bg-white" />
            <input type="text" placeholder="Libellé OD..." value={odForm.libelle} onChange={e => setOdForm({...odForm, libelle: e.target.value})} className="border border-purple-200 rounded p-1.5 text-xs bg-white" />
            <select value={odForm.debit} onChange={e => setOdForm({...odForm, debit: e.target.value})} className="border border-purple-200 rounded p-1.5 text-xs bg-white">
              <option value="">Compte Débit...</option>
              {comptesList.map(c => <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>)}
            </select>
            <select value={odForm.credit} onChange={e => setOdForm({...odForm, credit: e.target.value})} className="border border-purple-200 rounded p-1.5 text-xs bg-white">
              <option value="">Compte Crédit...</option>
              {comptesList.map(c => <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>)}
            </select>
            <input type="number" placeholder="Montant (€)" value={odForm.montant} onChange={e => setOdForm({...odForm, montant: e.target.value})} className="border border-purple-200 rounded p-1.5 text-xs col-span-2 bg-white" />
          </div>
          <button onClick={handleAddOD} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-medium text-sm transition-colors mt-auto">
            Enregistrer l'OD
          </button>
        </div>
      </div>

      {/* LIGNES EN ATTENTE (SAS) */}
      {lignesEnAttente.length > 0 && (
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <AlertTriangle size={18} /> Lignes bancaires à imputer ({lignesEnAttente.length})
            </h3>
            <button 
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir annuler l'import en cours et vider cette liste ?")) {
                  setLignesEnAttente([]);
                }
              }}
              className="text-sm bg-orange-200 hover:bg-orange-300 text-orange-900 px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <XCircle size={16} /> Annuler l'import (Vider)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-orange-900 font-semibold border-b border-orange-200">
                  <th className="py-2">Date</th>
                  <th className="py-2">Libellé</th>
                  <th className="py-2 text-right">Montant</th>
                  <th className="py-2 px-4">Compte (Classe 6 ou 7)</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {lignesEnAttente.map((ligne) => (
                  <tr key={ligne.id} className="border-b border-orange-100 bg-white hover:bg-orange-50/50 transition-colors">
                    <td className="py-2 px-2 text-slate-600">{ligne.date}</td>
                    <td className="py-2 px-2 text-slate-800 truncate max-w-xs">{ligne.libelle}</td>
                    <td className={`py-2 px-2 text-right font-medium ${ligne.montant > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {ligne.montant > 0 ? '+' : ''}{ligne.montant.toFixed(2)} €
                    </td>
                    <td className="py-2 px-4">
                      <div className="relative">
                        {/* CORRECTION ICI : value au lieu de defaultValue */}
                        <select 
                          value={ligne.comptePropose || ''}
                          onChange={(e) => {
                            if (e.target.value !== "") {
                              validerLigneBank(ligne.id, e.target.value);
                            }
                          }}
                          className={`border rounded-md px-2 py-1.5 w-full text-sm font-mono pr-8 focus:ring-2 focus:ring-indigo-500 appearance-none outline-none cursor-pointer ${ligne.comptePropose ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-bold' : 'border-slate-300 bg-white'}`}
                        >
                          <option value="">Sélectionner un compte...</option>
                          {ligne.comptePropose && !comptesList.find(c => c.code === ligne.comptePropose) && (
                            <option value={ligne.comptePropose}>{ligne.comptePropose} (Suggéré)</option>
                          )}
                          {comptesList.map(c => (
                            <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        {ligne.comptePropose && (
                          <Sparkles size={14} className="absolute right-7 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" title="Suggéré automatiquement par l'historique" />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button onClick={() => setLignesEnAttente(prev => prev.filter(l => l.id !== ligne.id))} className="text-slate-400 hover:text-red-500 transition-colors" title="Ignorer cette ligne">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLEAU DES ÉCRITURES VALIDÉES (LE GRAND LIVRE) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" /> Écritures Validées au Grand Livre
          </h3>
          <span className="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">
            {transactionsGlobales.length} écritures
          </span>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Libellé</th>
                <th className="py-3 px-4 text-center">Mouvement</th>
                <th className="py-3 px-4">Détail Compte</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionsGlobales.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-4 text-slate-800">{t.libelle}</td>
                  
                  {t.type === 'od' ? (
                    <td className="py-3 px-4 text-center font-medium text-purple-600">OD ({t.montant} €)</td>
                  ) : (
                    <td className={`py-3 px-4 text-center font-bold ${t.montant > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {t.montant > 0 ? '+' : ''}{Number(t.montant).toFixed(2)} €
                    </td>
                  )}
                  
                  {t.type === 'od' ? (
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 w-full max-w-[250px]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 w-3">D:</span>
                          <select 
                            value={t.compteDebit || ''} 
                            onChange={(e) => handleUpdateCompte(t.id, e.target.value, 'compteDebit')}
                            className="border border-slate-200 rounded p-1 text-xs bg-white w-full text-slate-700 outline-none focus:border-indigo-400"
                          >
                            <option value="">Non défini</option>
                            {comptesList.map(c => <option key={`d-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 w-3">C:</span>
                          <select 
                            value={t.compteCredit || ''} 
                            onChange={(e) => handleUpdateCompte(t.id, e.target.value, 'compteCredit')}
                            className="border border-slate-200 rounded p-1 text-xs bg-white w-full text-slate-700 outline-none focus:border-indigo-400"
                          >
                            <option value="">Non défini</option>
                            {comptesList.map(c => <option key={`c-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>)}
                          </select>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <td className="py-3 px-4">
                      <select 
                        value={t.compte || ''} 
                        onChange={(e) => handleUpdateCompte(t.id, e.target.value, 'compte')}
                        className="border border-slate-200 rounded p-1 text-xs bg-white max-w-[250px] w-full text-slate-700 font-mono outline-none focus:border-indigo-400"
                      >
                        <option value="">Non défini</option>
                        {comptesList.map(c => <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>)}
                      </select>
                    </td>
                  )}
                  
                  <td className="py-3 px-4 text-center flex items-center justify-center gap-2">
                    <button className="text-slate-300 hover:text-indigo-500 transition-colors mt-2" title="Attacher PDF">
                      <Paperclip size={16} />
                    </button>
                    <button onClick={() => handleDeleteValidated(t.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded transition-colors mt-1.5" title="Supprimer l'écriture">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {transactionsGlobales.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">Aucune écriture dans le Grand Livre.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
// --- 4. PLAN COMPTABLE ---
const PlanComptable = () => {
  const [comptes, setComptes] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [nouveauCode, setNouveauCode] = useState('');
  const [nouveauLibelle, setNouveauLibelle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputPlanRef = useRef(null);

  // Récupération des comptes depuis Firebase
  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      // Tri par numéro de compte
      liste.sort((a, b) => a.code.localeCompare(b.code));
      setComptes(liste);
    });
    return () => unsubscribe();
  }, []);

  const handleAjouter = async (e) => {
    e.preventDefault();
    if (!nouveauCode || !nouveauLibelle) {
      alert("Veuillez remplir le code et le libellé.");
      return;
    }
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comptes'), {
        code: nouveauCode,
        libelle: nouveauLibelle,
        date_creation: new Date().toISOString()
      });
      setNouveauCode('');
      setNouveauLibelle('');
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'ajout du compte.");
    }
  };

  const handleSupprimer = async (id) => {
    if (confirmDeleteId === id) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comptes', id));
        setConfirmDeleteId(null);
      } catch(e) {
        alert("Erreur lors de la suppression.");
      }
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  // NOUVEAU : Fonction d'importation CSV/XLSX
  const handleImportPlan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);

    const processRows = async (rows) => {
      let count = 0;
      // On commence à i = 1 pour ignorer la ligne d'en-tête
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const code = cols[0] ? String(cols[0]).trim() : '';
        const libelle = cols[1] ? String(cols[1]).trim() : '';

        if (code && libelle) {
          try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comptes'), {
              code: code,
              libelle: libelle,
              date_creation: new Date().toISOString()
            });
            count++;
          } catch(err) {
            console.error("Erreur sur la ligne", i, err);
          }
        }
      }
      setIsImporting(false);
      alert(`${count} comptes importés avec succès !`);
      if (fileInputPlanRef.current) fileInputPlanRef.current.value = ''; // Reset l'input
    };

    const ext = file.name.split('.').pop().toLowerCase();
    
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const lines = event.target.result.split('\n');
        const rows = lines.map(line => line.split(';').map(c => c.trim().replace(/"/g, '')));
        await processRows(rows);
      };
      reader.readAsText(file, 'ISO-8859-1');
    } else if (ext === 'xlsx') {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: false, defval: '' });
        await processRows(rows);
      } catch (err) {
        setIsImporting(false);
        alert("Erreur de lecture du fichier XLSX.");
      }
    }
  };

  const comptesFiltres = comptes.filter(c => 
    c.code.includes(recherche) || c.libelle.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSignature className="text-indigo-600" /> Plan Comptable
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gérez la liste de vos comptes (Classes 1 à 7).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne gauche : Ajout & Importation */}
        <div className="md:col-span-1">
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 sticky top-6">
            <h3 className="font-bold text-indigo-900 text-lg mb-4 flex items-center gap-2">
              <Plus size={18} /> Nouveau Compte
            </h3>
            <form onSubmit={handleAjouter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-indigo-700 mb-1">Code Comptable</label>
                <input 
                  type="text" 
                  placeholder="Ex: 606100" 
                  value={nouveauCode}
                  onChange={(e) => setNouveauCode(e.target.value)}
                  className="w-full border border-indigo-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-indigo-700 mb-1">Libellé</label>
                <input 
                  type="text" 
                  placeholder="Ex: Fournitures non stockables..." 
                  value={nouveauLibelle}
                  onChange={(e) => setNouveauLibelle(e.target.value)}
                  className="w-full border border-indigo-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
              >
                Ajouter au plan
              </button>
            </form>

            {/* NOUVEAU : Bloc d'importation */}
            <div className="mt-6 pt-5 border-t border-indigo-200">
              <h4 className="text-xs font-semibold text-indigo-700 mb-3 text-center uppercase tracking-wider">Importation en masse</h4>
              <input type="file" accept=".csv, .xlsx" className="hidden" ref={fileInputPlanRef} onChange={handleImportPlan} />
              <button 
                type="button" 
                onClick={() => fileInputPlanRef.current.click()}
                disabled={isImporting}
                className={`w-full bg-white border-2 border-indigo-200 hover:border-indigo-600 text-indigo-700 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Download size={16} /> {isImporting ? "Importation..." : "Importer (CSV / XLSX)"}
              </button>
              <p className="text-[10px] text-indigo-500 mt-2 text-center leading-tight">
                Fichier avec Colonne A : Code<br/>Colonne B : Libellé<br/>(La ligne 1 d'en-tête sera ignorée)
              </p>
            </div>

          </div>
        </div>

        {/* Colonne droite : Liste des comptes */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un compte..." 
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <span className="text-xs font-medium bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500">
                {comptesFiltres.length} compte(s)
              </span>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 shadow-sm">
                  <tr>
                    <th className="py-3 px-4 w-32">Code</th>
                    <th className="py-3 px-4">Libellé</th>
                    <th className="py-3 px-4 text-center w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comptesFiltres.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.code}</td>
                      <td className="py-3 px-4 text-slate-600">{c.libelle}</td>
                      <td className="py-3 px-4 text-center">
                        {confirmDeleteId === c.id ? (
                          <button onClick={() => handleSupprimer(c.id)} className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse">
                            Confirmer ?
                          </button>
                        ) : (
                          <button onClick={() => handleSupprimer(c.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded transition-colors" title="Supprimer">
                            <Trash2 size={16}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {comptesFiltres.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-slate-400">Aucun compte trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// APPLICATION PRINCIPALE
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('tableau_bord');
  const [transactionsGlobales, setTransactionsGlobales] = useState([]);

  // Fetch transactions from Firebase
  useEffect(() => {
    const fetchTx = () => {
      const q = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const txs = [];
        snapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() });
        });
        setTransactionsGlobales(txs);
      });
      return unsubscribe;
    };
    const unsub = fetchTx();
    return () => unsub();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'contact': return <InfosContact />;
      case 'etat_financier': return <EtatFinancier transactionsGlobales={transactionsGlobales} />;
      case 'grand_livre': return <GrandLivre transactionsGlobales={transactionsGlobales} />;
      case 'plan_comptable': return <PlanComptable />;
      
      // Placeholders pour les autres pages
      case 'tableau_bord': return <PlaceholderPage title="Tableau de Bord" />;
      case 'scolarite': return <PlaceholderPage title="Scolarité" />;
      case 'factures_parents': return <PlaceholderPage title="Mes Factures (Parents)" />;
      case 'menage_weekend': return <PlaceholderPage title="Planning : Ménage Week-end" />;
      case 'garde_cantine': return <PlaceholderPage title="Planning : Garde Cantine / Cour" />;
      case 'budget': return <PlaceholderPage title="Budget Prévisionnel" />;
      case 'notes_frais': return <PlaceholderPage title="Notes de Frais" />;
      case 'dons_recus': return <PlaceholderPage title="Dons et reçus fiscaux" />;
      case 'evenements_ecole': return <PlaceholderPage title="Liste des Évènements" />;
      case 'evenements_rentabilite': return <PlaceholderPage title="Rentabilité des Évènements" />;
      case 'gestion_acces': return <PlaceholderPage title="Gestion des Accès" />;
      case 'factures_familles': return <PlaceholderPage title="Factures Familles (Admin)" />;
      case 'equipe_contrats': return <PlaceholderPage title="Équipe et Contrats" />;
      case 'uniformes_stock': return <PlaceholderPage title="Uniformes & Stock" />;
      default: return <PlaceholderPage title="Module en construction" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* MENU LATÉRAL */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
          <div className="bg-white p-2 rounded-xl mb-3 shadow-lg">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white font-bold text-lg text-center leading-tight">Cours<br/>Tom Morel</h1>
          <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-semibold">ERP - Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          
          {/* ESPACE FAMILLE */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Espace Famille</h3>
            <button onClick={() => setActiveTab('contact')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Info size={18} /> Infos & Contact
            </button>
            <button onClick={() => setActiveTab('scolarite')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'scolarite' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <GraduationCap size={18} /> Scolarité
            </button>
            <button onClick={() => setActiveTab('factures_parents')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'factures_parents' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Receipt size={18} /> Mes Factures
            </button>
          </div>

          {/* PLANNINGS PARENTS */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Plannings Parents</h3>
            <button onClick={() => setActiveTab('menage_weekend')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'menage_weekend' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <AlertTriangle size={18} /> Ménage Week-end
            </button>
            <button onClick={() => setActiveTab('garde_cantine')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'garde_cantine' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <CheckCircle2 size={18} /> Garde Cantine / Cour
            </button>
          </div>

          {/* PILOTAGE */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Pilotage</h3>
            <button onClick={() => setActiveTab('tableau_bord')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'tableau_bord' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} /> Tableau de Bord
            </button>
            <button onClick={() => setActiveTab('etat_financier')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'etat_financier' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <PieChart size={18} /> État Financier
            </button>
          </div>

          {/* COMPTABILITÉ & FINANCES */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Compta & Finances</h3>
            <button onClick={() => setActiveTab('grand_livre')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'grand_livre' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <BookOpen size={18} /> Grand Livre
            </button>
            <button onClick={() => setActiveTab('plan_comptable')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'plan_comptable' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <FileSignature size={18} /> Plan Comptable
            </button>
            <button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'budget' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Target size={18} /> Budget
            </button>
            <button onClick={() => setActiveTab('notes_frais')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'notes_frais' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <FileText size={18} /> Notes de Frais
            </button>
            <button onClick={() => setActiveTab('dons_recus')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'dons_recus' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Heart size={18} /> Dons et reçus fiscaux
            </button>
          </div>

          {/* ÉVÈNEMENTS */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Évènements</h3>
            <button onClick={() => setActiveTab('evenements_ecole')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'evenements_ecole' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Calendar size={18} /> Liste des Évènements
            </button>
            <button onClick={() => setActiveTab('evenements_rentabilite')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'evenements_rentabilite' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <TrendingUp size={18} /> Rentabilité (Bilan)
            </button>
          </div>

          {/* ADMINISTRATION */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Administration</h3>
            <button onClick={() => setActiveTab('gestion_acces')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'gestion_acces' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Lock size={18} /> Gestion Accès
            </button>
            <button onClick={() => setActiveTab('factures_familles')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'factures_familles' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <FileSpreadsheet size={18} /> Factures Familles
            </button>
            <button onClick={() => setActiveTab('equipe_contrats')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'equipe_contrats' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Users size={18} /> Équipe (Contrats)
            </button>
            <button onClick={() => setActiveTab('uniformes_stock')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'uniformes_stock' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Package size={18} /> Uniformes & Stock
            </button>
          </div>

        </nav>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 text-slate-500">
            <h2 className="font-semibold text-slate-800">
              {activeTab.replace(/_/g, ' ').toUpperCase()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-slate-800">Admin</div>
              <div className="text-xs text-slate-500">Profil : Direction</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-200">
              A
            </div>
          </div>
        </header>

        {/* ZONE D'AFFICHAGE DES MODULES */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
