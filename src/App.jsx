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
    // CORRECTION : Traduction des dates (JJ/MM/AAAA -> AAAA-MM-JJ) pour le filtre
    const txFiltrees = transactionsGlobales.filter(t => {
      let dateIso = t.date;
      if (dateIso && dateIso.includes('/')) {
        const [d, m, y] = dateIso.split('/');
        dateIso = `${y.length === 2 ? '20'+y : y}-${m}-${d}`;
      }
      return dateIso >= periode.debut && dateIso <= periode.fin;
    });
    
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
  const [comptesList, setComptesList] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  const [odFormDate, setOdFormDate] = useState('');
  const [odFormLibelle, setOdFormLibelle] = useState('');
  const [odFormCommentaire, setOdFormCommentaire] = useState('');
  const [odLines, setOdLines] = useState([
    { id: 1, compte: '', debit: '', credit: '' },
    { id: 2, compte: '', debit: '', credit: '' }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompteFilter, setSelectedCompteFilter] = useState(''); 
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  const fileInputCsvRef = useRef(null);
  const fileInputXlsxRef = useRef(null);
  const fileInputPaieRef = useRef(null);
  const fileInputODRef = useRef(null);

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

  const devinerCompte = (libelleTxt) => {
    if (!libelleTxt) return '';
    const txt = libelleTxt.toLowerCase();

    const memoire = transactionsGlobales.find(tx => 
      tx.compte && tx.type !== 'od' && tx.libelle && (txt.includes(tx.libelle.toLowerCase()) || tx.libelle.toLowerCase().includes(txt))
    );
    if (memoire) return memoire.compte;

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
    let doublonsCount = 0;

    const preparerLignes = (lignesBrutes) => {
      const nouvellesLignes = [];
      for (let i = 0; i < lignesBrutes.length; i++) {
        const cols = lignesBrutes[i];
        if (cols.length >= 6) {
          const val5 = String(cols[5] || '').replace(/\s/g, '').replace(',', '.');
          const val6 = String(cols[6] || '').replace(/\s/g, '').replace(',', '.');
          
          let mt = 0;
          if (val6 !== '' && val6 !== 'undefined') {
            const credit = parseFloat(val6) || 0;
            const debit = parseFloat(val5) || 0;
            mt = credit !== 0 ? Math.abs(credit) : -Math.abs(debit);
          } else {
            mt = parseFloat(val5) || 0;
          }
          
          const dateExtrait = cols[0];
          const libelleExtrait = cols[1] || cols[3];
          
          if (mt !== 0) {
            const isDuplicate = transactionsGlobales.some(t => t.date === dateExtrait && t.libelle === libelleExtrait && Math.abs(t.montant) === Math.abs(mt)) ||
                                lignesEnAttente.some(t => t.date === dateExtrait && t.libelle === libelleExtrait && Math.abs(t.montant) === Math.abs(mt)) ||
                                nouvellesLignes.some(t => t.date === dateExtrait && t.libelle === libelleExtrait && Math.abs(t.montant) === Math.abs(mt));

            if (isDuplicate) {
              doublonsCount++;
              continue; 
            }

            nouvellesLignes.push({
              id: Math.random().toString(36).substr(2, 9),
              date: dateExtrait,
              libelle: libelleExtrait,
              reference: cols[2], 
              typeOp: cols[4],
              commentaire: '',
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
        alert(`${resultat.length} ligne(s) importée(s) avec succès.${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
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
        alert(`${resultat.length} ligne(s) importée(s) avec succès.${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
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
      let doublonsCount = 0;
      
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
            const libelleFinal = `(PAIE) ${ecritureLib} - ${compteLib}`;
            const mt = debit > 0 ? debit : credit;

            const isDuplicate = transactionsGlobales.some(t => t.date === formattedDate && t.libelle === libelleFinal && Math.abs(t.montant) === Math.abs(mt));

            if (isDuplicate) {
              doublonsCount++;
              continue;
            }

            const newTx = {
              date: formattedDate,
              libelle: libelleFinal,
              montant: mt,
              type: 'od',
              compteDebit: debit > 0 ? compteNum : '',
              compteCredit: credit > 0 ? compteNum : '',
              reference: pieceRef,
              typeOp: 'Paie',
              commentaire: '',
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
      alert(`${count} ligne(s) de paie intégrée(s) !${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
      if (fileInputPaieRef.current) fileInputPaieRef.current.value = '';
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportODMass = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const processRows = async (rows) => {
      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols && cols.length >= 9) {
          const rawDate = cols[0];
          const journal = String(cols[2] || '').trim().toUpperCase();
          let compteNum = String(cols[3] || '').trim();
          const pieceRef = cols[5] || '';
          const libelle = cols[6] || '';
          
          let debitVal = parseFloat(String(cols[7] || '').replace(/\s/g, '').replace(',', '.')) || 0;
          let creditVal = parseFloat(String(cols[8] || '').replace(/\s/g, '').replace(',', '.')) || 0;
          const commentaire = cols[11] || '';

          // Étape 1 : Inversion purement mathématique
          if (debitVal < 0) {
            creditVal = Math.abs(debitVal);
            debitVal = 0;
          } else if (creditVal < 0) {
            debitVal = Math.abs(creditVal);
            creditVal = 0;
          }

          if (rawDate && libelle && (debitVal !== 0 || creditVal !== 0)) {
            let formattedDate = rawDate;
            if (rawDate.includes('/')) {
              const [d, m, y] = rawDate.split('/');
              formattedDate = `${y.length === 2 ? '20'+y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            }

            const isDebit = debitVal > 0;
            const montantFinal = isDebit ? debitVal : creditVal;

            // Étape 2 : Intelligence Comptable (Symétrie Classe 6 / Classe 7)
            if (isDebit && compteNum.startsWith('7')) {
              // Un compte 7 au débit devient un compte 6
              compteNum = '6' + compteNum.substring(1);
            } else if (!isDebit && compteNum.startsWith('6')) {
              // Un compte 6 au crédit devient un compte 7
              compteNum = '7' + compteNum.substring(1);
            }

            const prefix = journal === 'PAIE' ? '(PAIE)' : '(OD)';

            const newTx = {
              date: formattedDate,
              libelle: `${prefix} ${libelle}`,
              montant: montantFinal,
              type: 'od',
              compteDebit: isDebit ? compteNum : '',
              compteCredit: !isDebit ? compteNum : '',
              reference: pieceRef,
              typeOp: journal || 'OD', 
              commentaire: commentaire,
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
      alert(`${count} lignes (OD/PAIE) importées avec succès dans le Grand Livre !`);
      if (fileInputODRef.current) fileInputODRef.current.value = '';
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
        alert("Erreur de lecture du fichier XLSX.");
      }
    }
  };

  const validerLigneBank = async (ligneId, compteCode, commentaireTxt) => {
    const ligne = lignesEnAttente.find(l => l.id === ligneId);
    if (!ligne || !compteCode) {
      alert("Veuillez sélectionner un compte avant de valider.");
      return;
    }
    
    const newTx = {
      date: ligne.date,
      libelle: ligne.libelle,
      montant: ligne.montant,
      compte: compteCode,
      reference: ligne.reference || '',
      typeOp: ligne.typeOp || '',
      commentaire: commentaireTxt || '',
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

  const validerLignesPretes = async () => {
    const lignesAValider = lignesEnAttente.filter(l => l.comptePropose);
    if (lignesAValider.length === 0) return;
    
    if (window.confirm(`Vous êtes sur le point d'envoyer ${lignesAValider.length} écriture(s) d'un seul coup vers le Grand Livre. Confirmer ?`)) {
      for (const ligne of lignesAValider) {
        const newTx = {
          date: ligne.date,
          libelle: ligne.libelle,
          montant: ligne.montant,
          compte: ligne.comptePropose,
          reference: ligne.reference || '',
          typeOp: ligne.typeOp || '',
          commentaire: ligne.commentaire || '',
          type: ligne.montant < 0 ? 'depense' : 'recette',
          date_creation: new Date().toISOString()
        };
        try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
        } catch(e) {
          console.error("Erreur sur l'insertion de masse", e);
        }
      }
      setLignesEnAttente(prev => prev.filter(l => !l.comptePropose));
    }
  };

  const addOdLine = () => setOdLines([...odLines, { id: Date.now(), compte: '', debit: '', credit: '' }]);
  const removeOdLine = (id) => setOdLines(odLines.filter(l => l.id !== id));
  
  const updateOdLine = (id, field, value) => {
    setOdLines(odLines.map(l => {
      if (l.id === id) {
        const updatedLine = { ...l, [field]: value };
        if (field === 'debit' && value !== '') updatedLine.credit = '';
        if (field === 'credit' && value !== '') updatedLine.debit = '';
        return updatedLine;
      }
      return l;
    }));
  };

  const totalDebitOD = odLines.reduce((sum, l) => sum + (parseFloat(l.debit) || 0), 0);
  const totalCreditOD = odLines.reduce((sum, l) => sum + (parseFloat(l.credit) || 0), 0);
  const isOdBalanced = Math.abs(totalDebitOD - totalCreditOD) < 0.01 && totalDebitOD > 0;

  const handleAddOD = async () => {
    if (!odFormDate || !odFormLibelle) return alert('Date et libellé requis.');
    if (!isOdBalanced) return alert("L'OD doit être équilibrée (Total Débit = Total Crédit) et supérieure à 0.");
    
    for (const line of odLines) {
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      if (!line.compte && (debit > 0 || credit > 0)) {
         return alert('Veuillez sélectionner un compte pour chaque ligne où vous avez saisi un montant.');
      }
    }

    try {
      for (const line of odLines) {
        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;
        if (debit > 0 || credit > 0) {
          const newTx = {
            date: odFormDate,
            libelle: `(OD) ${odFormLibelle}`,
            montant: debit > 0 ? debit : credit,
            type: 'od',
            compteDebit: debit > 0 ? line.compte : '',
            compteCredit: credit > 0 ? line.compte : '',
            typeOp: 'OD',
            commentaire: odFormCommentaire,
            date_creation: new Date().toISOString()
          };
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTx);
        }
      }
      setOdFormDate('');
      setOdFormLibelle('');
      setOdFormCommentaire('');
      setOdLines([{ id: 1, compte: '', debit: '', credit: '' }, { id: 2, compte: '', debit: '', credit: '' }]);
      alert("OD enregistrée et ventilée avec succès !");
    } catch(e) {
      alert("Erreur lors de la création de l'OD.");
    }
  };

  const handleDeleteValidated = async (txId) => {
    if (confirmDeleteId === txId) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId));
        setConfirmDeleteId(null);
      } catch(e) { 
        alert('Erreur lors de la suppression.'); 
      }
    } else {
      setConfirmDeleteId(txId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const handleUpdateField = async (txId, newValue, field) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId), {
        [field]: newValue
      });
    } catch(e) {
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const parseDateForSort = (dStr) => {
    if (!dStr) return 0;
    if (dStr.includes('/')) {
      const [day, month, year] = dStr.split('/');
      return new Date(`${year}-${month}-${day}`).getTime();
    }
    return new Date(dStr).getTime();
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactionsGlobales];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.libelle && t.libelle.toLowerCase().includes(lowerTerm)) ||
        (t.compte && t.compte.toLowerCase().includes(lowerTerm)) ||
        (t.compteDebit && t.compteDebit.toLowerCase().includes(lowerTerm)) ||
        (t.compteCredit && t.compteCredit.toLowerCase().includes(lowerTerm)) ||
        (t.reference && t.reference.toLowerCase().includes(lowerTerm)) ||
        (t.commentaire && t.commentaire.toLowerCase().includes(lowerTerm))
      );
    }

    if (selectedCompteFilter) {
      result = result.filter(t => 
        t.compte === selectedCompteFilter || 
        t.compteDebit === selectedCompteFilter || 
        t.compteCredit === selectedCompteFilter
      );
    }

    result.sort((a, b) => {
      let valA, valB;
      
      if (sortConfig.key === 'source') {
        const getSource = (tx) => tx.type === 'od' ? (tx.libelle?.includes('(PAIE)') ? 'paie' : 'od') : 'banque';
        valA = getSource(a);
        valB = getSource(b);
      } else if (sortConfig.key === 'date') {
        valA = parseDateForSort(a.date);
        valB = parseDateForSort(b.date);
      } else if (sortConfig.key === 'montant') {
        valA = Number(a.montant) || 0;
        valB = Number(b.montant) || 0;
      } else if (sortConfig.key === 'compte') {
        valA = (a.type === 'od' ? a.compteDebit : a.compte) || '';
        valB = (b.type === 'od' ? b.compteDebit : b.compte) || '';
      } else {
        valA = (a[sortConfig.key] || '').toLowerCase();
        valB = (b[sortConfig.key] || '').toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [transactionsGlobales, searchTerm, selectedCompteFilter, sortConfig]);

  const nbLignesPretes = lignesEnAttente.filter(l => l.comptePropose).length;

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto px-2">
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Grand Livre (Import & Saisie)
          </h2>
          <p className="text-slate-500 text-sm mt-1">Importez vos relevés bancaires, fiches de paie ou saisissez une OD ventilée.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BANQUE */}
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

        {/* PAIE */}
        <div className="bg-pink-50 p-6 rounded-xl border border-pink-200 flex flex-col justify-center items-center text-center space-y-4">
          <h3 className="font-bold text-pink-900 text-lg">Fiches de Paie</h3>
          <p className="text-sm text-pink-700">Importez le fichier TXT exporté depuis le logiciel de paie.</p>
          <div className="flex-1"></div>
          <input type="file" accept=".txt,.tsv" className="hidden" ref={fileInputPaieRef} onChange={handleImportPaie} />
          <button onClick={() => fileInputPaieRef.current.click()} className="w-full justify-center bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors">
            <Users size={16} /> Importer Fichier (.txt)
          </button>
        </div>

        {/* OD MANUELLE + IMPORT MASSE */}
        <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 flex flex-col h-[350px]">
          <div className="flex justify-between items-center shrink-0 mb-3">
            <h3 className="font-bold text-purple-900 text-lg flex items-center gap-2">
              <FileText size={18} /> Opération Diverse
            </h3>
            <input type="file" accept=".csv,.xlsx" className="hidden" ref={fileInputODRef} onChange={handleImportODMass} />
            <button onClick={() => fileInputODRef.current.click()} className="text-[10px] uppercase font-bold bg-purple-200 text-purple-800 px-2 py-1 rounded hover:bg-purple-300 transition-colors flex items-center gap-1" title="Format Colonnes A à I + L">
              <Download size={12}/> Import masse (.csv / .xlsx)
            </button>
          </div>
          
          <div className="flex gap-2 shrink-0 mb-2">
            <input type="date" value={odFormDate} onChange={e => setOdFormDate(e.target.value)} className="border border-purple-200 rounded p-1.5 text-xs bg-white w-1/3 outline-none focus:ring-1 focus:ring-purple-500" />
            <input type="text" placeholder="Libellé OD..." value={odFormLibelle} onChange={e => setOdFormLibelle(e.target.value)} className="border border-purple-200 rounded p-1.5 text-xs bg-white flex-1 outline-none focus:ring-1 focus:ring-purple-500" />
          </div>

          <div className="flex gap-2 shrink-0 mb-2">
            <input type="text" placeholder="Commentaire optionnel..." value={odFormCommentaire} onChange={e => setOdFormCommentaire(e.target.value)} className="border border-purple-200 rounded p-1.5 text-xs bg-white w-full outline-none focus:ring-1 focus:ring-purple-500" />
          </div>

          <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 min-h-[80px]">
            {odLines.map((l) => (
              <div key={l.id} className="flex gap-1 items-center">
                <select value={l.compte} onChange={e => updateOdLine(l.id, 'compte', e.target.value)} className="border border-purple-200 rounded p-1 text-xs bg-white w-1/2 outline-none focus:ring-1 focus:ring-purple-500">
                  <option value="">Compte...</option>
                  {comptesList.map(c => <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>)}
                </select>
                <input type="number" placeholder="Débit" value={l.debit} onChange={e => updateOdLine(l.id, 'debit', e.target.value)} className="border border-purple-200 rounded p-1 text-xs bg-white w-1/4 outline-none focus:ring-1 focus:ring-purple-500" />
                <input type="number" placeholder="Crédit" value={l.credit} onChange={e => updateOdLine(l.id, 'credit', e.target.value)} className="border border-purple-200 rounded p-1 text-xs bg-white w-1/4 outline-none focus:ring-1 focus:ring-purple-500" />
                <button onClick={() => removeOdLine(l.id)} className="text-slate-300 hover:text-red-500"><XCircle size={14} /></button>
              </div>
            ))}
            <button onClick={addOdLine} className="text-[11px] text-purple-600 font-bold mt-1 hover:underline">
              + Ajouter une ligne
            </button>
          </div>

          <div className="shrink-0 flex flex-col gap-2 pt-2 border-t border-purple-200 mt-2">
            <div className="flex justify-between items-center text-xs font-bold text-purple-900 bg-purple-100 p-2 rounded">
              <span>TOTAL</span>
              <div className="flex gap-3">
                <span className={isOdBalanced ? 'text-emerald-600' : 'text-red-600'}>D: {totalDebitOD.toFixed(2)}</span>
                <span className={isOdBalanced ? 'text-emerald-600' : 'text-red-600'}>C: {totalCreditOD.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleAddOD} 
              disabled={!isOdBalanced}
              className={`w-full py-2 rounded font-medium text-sm transition-colors ${isOdBalanced ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-300 text-purple-100 cursor-not-allowed'}`}
            >
              Enregistrer l'OD
            </button>
          </div>
        </div>
      </div>

      {lignesEnAttente.length > 0 && (
        <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <AlertTriangle size={18} /> Lignes bancaires à imputer ({lignesEnAttente.length})
            </h3>
            <div className="flex items-center gap-3">
              {nbLignesPretes > 0 && (
                <button 
                  onClick={() => {
                    lignesEnAttente.forEach(l => { if(l.comptePropose) validerLigneBank(l.id, l.comptePropose, l.commentaire); });
                  }}
                  className="text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-md"
                >
                  <CheckCircle2 size={18} /> Tout Valider ({nbLignesPretes})
                </button>
              )}
              <button onClick={() => setLignesEnAttente([])} className="text-sm bg-white border border-orange-300 hover:bg-orange-100 text-orange-800 px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                <XCircle size={16} /> Vider la liste
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-orange-900 font-semibold border-b border-orange-200">
                  <th className="py-2">Date</th>
                  <th className="py-2">Libellé</th>
                  <th className="py-2 text-right">Montant</th>
                  <th className="py-2 px-2">Commentaire</th>
                  <th className="py-2 px-4">Compte</th>
                  <th className="py-2 text-center w-28">Action</th>
                </tr>
              </thead>
              <tbody>
                {lignesEnAttente.map((ligne) => (
                  <tr key={ligne.id} className="border-b border-orange-100 bg-white hover:bg-orange-50/50 transition-colors">
                    <td className="py-3 px-2 text-slate-600">{ligne.date}</td>
                    <td className="py-3 px-2 text-slate-800 truncate max-w-xs">{ligne.libelle}</td>
                    <td className={`py-3 px-2 text-right font-bold whitespace-nowrap ${ligne.montant > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {ligne.montant > 0 ? '+' : ''}{ligne.montant.toFixed(2)} €
                    </td>
                    <td className="py-3 px-2">
                      <input 
                        type="text" 
                        placeholder="Commentaire..." 
                        value={ligne.commentaire || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLignesEnAttente(prev => prev.map(l => l.id === ligne.id ? { ...l, commentaire: val } : l));
                        }}
                        className="border border-slate-300 rounded px-2 py-1 text-xs w-full outline-none focus:border-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <select 
                          value={ligne.comptePropose || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLignesEnAttente(prev => prev.map(l => 
                              (l.id === ligne.id || l.libelle === ligne.libelle) 
                                ? { ...l, comptePropose: val } 
                                : l
                            ));
                          }}
                          className={`border rounded-lg px-3 py-2 w-full text-sm font-mono pr-8 focus:ring-2 focus:ring-indigo-500 appearance-none outline-none cursor-pointer transition-all ${ligne.comptePropose ? 'border-indigo-400 bg-indigo-50 text-indigo-800 font-bold shadow-inner' : 'border-slate-300 bg-white'}`}
                        >
                          <option value="">Sélectionner un compte...</option>
                          {ligne.comptePropose && !comptesList.find(c => c.code === ligne.comptePropose) && (
                            <option value={ligne.comptePropose}>{ligne.comptePropose} (Suggéré)</option>
                          )}
                          {comptesList.map(c => (
                            <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        <button 
                          onClick={() => validerLigneBank(ligne.id, ligne.comptePropose, ligne.commentaire)}
                          disabled={!ligne.comptePropose}
                          className={`p-1.5 rounded-md transition-all shadow-sm ${ligne.comptePropose ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => setLignesEnAttente(prev => prev.filter(l => l.id !== ligne.id))} className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
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
        
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" /> Écritures Validées au Grand Livre
          </h3>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select 
              value={selectedCompteFilter}
              onChange={(e) => setSelectedCompteFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            >
              <option value="">Tous les comptes (Filtre...)</option>
              {comptesList.map(c => (
                <option key={`filter-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>
              ))}
            </select>
            {selectedCompteFilter && (
              <button onClick={() => setSelectedCompteFilter('')} className="text-xs text-indigo-600 font-bold hover:underline">
                Réinitialiser filtre
              </button>
            )}

            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher (texte, commentaire...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <span className="text-xs font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 shadow-sm whitespace-nowrap">
              {filteredAndSortedTransactions.length} écritures
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm text-left min-w-max">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase font-semibold sticky top-0 shadow-sm z-10">
              <tr>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date comptable {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3 px-3 text-slate-400">ID Unique</th>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('source')}>
                  <div className="flex items-center gap-1">Source {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors min-w-[200px]" onClick={() => handleSort('libelle')}>
                  <div className="flex items-center gap-1">Libellé simplifié {sortConfig.key === 'libelle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3 px-3 text-slate-400 min-w-[150px]">Infos complémentaires</th>
                <th className="py-3 px-3 text-slate-400">Type Op.</th>
                <th className="py-3 px-3 text-slate-400 min-w-[180px]">Commentaire</th>
                <th className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('montant')}>
                  <div className="flex items-center justify-end gap-1">Débit {sortConfig.key === 'montant' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('montant')}>
                  <div className="flex items-center justify-end gap-1">Crédit {sortConfig.key === 'montant' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors min-w-[220px]" onClick={() => handleSort('compte')}>
                  <div className="flex items-center gap-1">Détail Compte {sortConfig.key === 'compte' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedTransactions.map(t => {
                let sourceLabel = 'Banque';
                let sourceColor = 'bg-blue-50 text-blue-700 border-blue-200';
                if (t.type === 'od') {
                  if (t.typeOp === 'PAIE' || (t.libelle && t.libelle.includes('(PAIE)'))) {
                    sourceLabel = 'Paie';
                    sourceColor = 'bg-pink-50 text-pink-700 border-pink-200';
                  } else {
                    sourceLabel = 'OD';
                    sourceColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  }
                }

                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{t.date}</td>
                    
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]" title={t.id}>
                      {t.id.substring(0, 6)}...
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${sourceColor}`}>
                        {sourceLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-800 font-medium whitespace-normal max-w-xs">
                      {t.libelle}
                    </td>

                    <td className="py-3 px-3 text-slate-600 text-xs whitespace-normal max-w-[150px]">
                      {t.reference || <span className="text-slate-300 italic">-</span>}
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-xs whitespace-nowrap">
                      {t.typeOp || <span className="text-slate-300 italic">-</span>}
                    </td>
                    
                    <td className="py-3 px-3 text-slate-600 text-xs whitespace-normal max-w-[200px]">
                      {editingRowId === t.id ? (
                        <input 
                          type="text" 
                          defaultValue={t.commentaire || ''} 
                          onBlur={(e) => handleUpdateField(t.id, e.target.value, 'commentaire')}
                          className="border border-indigo-300 rounded p-1 text-xs bg-indigo-50 w-full outline-none"
                          placeholder="Ajouter un commentaire..."
                          autoFocus
                        />
                      ) : (
                        t.commentaire || <span className="text-slate-300 italic">-</span>
                      )}
                    </td>

                    {t.type === 'od' ? (
                      <>
                        <td className="py-3 px-3 text-right font-medium text-purple-600 whitespace-nowrap">
                          {t.compteDebit ? Number(t.montant).toFixed(2) + ' €' : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-purple-600 whitespace-nowrap">
                          {t.compteCredit ? Number(t.montant).toFixed(2) + ' €' : '-'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3 text-right font-bold text-red-600 whitespace-nowrap">
                          {t.montant < 0 ? Math.abs(t.montant).toFixed(2) + ' €' : '-'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                          {t.montant > 0 ? Number(t.montant).toFixed(2) + ' €' : '-'}
                        </td>
                      </>
                    )}
                    
                    <td className="py-3 px-3">
                      {editingRowId === t.id ? (
                        t.type === 'od' ? (
                          (t.compteDebit && t.compteCredit) ? (
                            <div className="flex flex-col gap-1 w-full min-w-[200px]">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 w-3">D:</span>
                                <select value={t.compteDebit || ''} onChange={(e) => handleUpdateField(t.id, e.target.value, 'compteDebit')} className="border border-indigo-300 rounded p-1 text-xs bg-indigo-50 w-full text-indigo-800 outline-none">
                                  <option value="">Non défini</option>
                                  {comptesList.map(c => <option key={`d-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>)}
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-500 w-3">C:</span>
                                <select value={t.compteCredit || ''} onChange={(e) => handleUpdateField(t.id, e.target.value, 'compteCredit')} className="border border-indigo-300 rounded p-1 text-xs bg-indigo-50 w-full text-indigo-800 outline-none">
                                  <option value="">Non défini</option>
                                  {comptesList.map(c => <option key={`c-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>)}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <select 
                              value={t.compteDebit || t.compteCredit || ''} 
                              onChange={(e) => {
                                handleUpdateField(t.id, e.target.value, t.compteDebit ? 'compteDebit' : 'compteCredit');
                                setEditingRowId(null);
                              }}
                              className="border border-purple-300 rounded p-2 text-xs bg-purple-50 min-w-[200px] w-full text-purple-800 font-mono outline-none"
                            >
                              <option value="">Non défini</option>
                              {comptesList.map(c => <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>)}
                            </select>
                          )
                        ) : (
                          <select 
                            value={t.compte || ''} 
                            onChange={(e) => {
                              handleUpdateField(t.id, e.target.value, 'compte');
                              setEditingRowId(null);
                            }}
                            className="border border-indigo-300 rounded p-2 text-xs bg-indigo-50 min-w-[200px] w-full text-indigo-800 font-mono outline-none"
                          >
                            <option value="">Non défini</option>
                            {comptesList.map(c => <option key={c.id} value={c.code}>{c.code} - {c.libelle}</option>)}
                          </select>
                        )
                      ) : (
                        t.type === 'od' ? (
                          (t.compteDebit && t.compteCredit) ? (
                            <div className="flex flex-col gap-0.5 min-w-[200px]">
                              <div className="text-xs text-slate-500 truncate"><span className="font-bold text-slate-700">D:</span> {t.compteDebit} {t.compteDebit && `- ${comptesList.find(c => c.code === t.compteDebit)?.libelle || ''}`}</div>
                              <div className="text-xs text-slate-500 truncate"><span className="font-bold text-slate-700">C:</span> {t.compteCredit} {t.compteCredit && `- ${comptesList.find(c => c.code === t.compteCredit)?.libelle || ''}`}</div>
                            </div>
                          ) : (
                            <div className="flex items-center w-fit min-w-[200px]">
                              <span className="bg-purple-50 px-2 py-1.5 rounded-md text-xs font-mono text-purple-700 border border-purple-200 max-w-[220px] truncate shadow-sm">
                                {t.compteDebit ? `${t.compteDebit} - ${comptesList.find(c => c.code === t.compteDebit)?.libelle || ''}` : `${t.compteCredit} - ${comptesList.find(c => c.code === t.compteCredit)?.libelle || ''}`}
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center w-fit min-w-[200px]">
                            <span className="bg-slate-50 px-2 py-1.5 rounded-md text-xs font-mono text-slate-700 border border-slate-200 max-w-[220px] truncate shadow-sm">
                              {t.compte ? `${t.compte} - ${comptesList.find(c => c.code === t.compte)?.libelle || ''}` : 'Non défini'}
                            </span>
                          </div>
                        )
                      )}
                    </td>
                    
                    <td className="py-3 px-3 text-center flex items-center justify-center gap-2">
                      {editingRowId === t.id ? (
                        <button onClick={() => setEditingRowId(null)} className="text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm mt-1.5">
                          OK
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setEditingRowId(t.id)} className="text-slate-300 hover:text-indigo-500 p-1.5 rounded transition-colors mt-1.5" title="Modifier">
                            <span className="font-bold text-lg leading-none">✎</span>
                          </button>
                          <button className="text-slate-300 hover:text-indigo-500 transition-colors mt-1.5" title="Attacher PDF">
                            <Paperclip size={16} />
                          </button>
                          {confirmDeleteId === t.id ? (
                            <button onClick={() => handleDeleteValidated(t.id)} className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs font-bold animate-pulse mt-1.5">
                              Confirmer ?
                            </button>
                          ) : (
                            <button onClick={() => handleDeleteValidated(t.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded transition-colors mt-1.5" title="Supprimer">
                              <Trash2 size={16}/>
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedTransactions.length === 0 && (
                <tr>
                  <td colSpan="11" className="py-8 text-center text-slate-400">Aucune écriture trouvée.</td>
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
  const [newCompte, setNewCompte] = useState({ code: '', libelle: '' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour la modification en ligne
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', libelle: '' });

  // Récupération des comptes
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

  // Ajouter un compte
  const handleAddCompte = async () => {
    if (!newCompte.code || !newCompte.libelle) return;
    
    // Vérifier si le code existe déjà
    if (comptes.some(c => c.code === newCompte.code)) {
      alert("Ce numéro de compte existe déjà !");
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comptes'), {
        code: newCompte.code,
        libelle: newCompte.libelle
      });
      setNewCompte({ code: '', libelle: '' });
    } catch(e) {
      alert("Erreur lors de l'ajout du compte.");
    }
  };

  // Supprimer un compte
  const handleDeleteCompte = async (id, code) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte ${code} ?`)) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comptes', id));
      } catch(e) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // Démarrer la modification
  const startEdit = (compte) => {
    setEditingId(compte.id);
    setEditForm({ code: compte.code, libelle: compte.libelle });
  };

  // Sauvegarder la modification
  const handleSaveEdit = async (id) => {
    if (!editForm.code || !editForm.libelle) return alert("Les champs ne peuvent pas être vides.");
    
    // Vérifier si le nouveau code existe déjà AILLEURS que sur la ligne actuelle
    if (comptes.some(c => c.code === editForm.code && c.id !== id)) {
      alert("Ce numéro de compte est déjà utilisé par un autre compte !");
      return;
    }

    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comptes', id), {
        code: editForm.code,
        libelle: editForm.libelle
      });
      setEditingId(null);
    } catch(e) {
      alert("Erreur lors de la modification.");
    }
  };

  // Filtrage
  const filteredComptes = comptes.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Plan Comptable
          </h2>
          <p className="text-slate-500 text-sm mt-1">Gérez la nomenclature de vos comptes (Classe 1 à 7).</p>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          <span className="text-indigo-800 font-bold text-lg">{comptes.length}</span>
          <span className="text-indigo-600 text-sm ml-1">comptes actifs</span>
        </div>
      </div>

      {/* Ajout et Recherche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Créer un nouveau compte</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Code (ex: 606100)" 
              value={newCompte.code}
              onChange={e => setNewCompte({...newCompte, code: e.target.value.replace(/[^0-9]/g, '')})}
              className="border border-slate-300 rounded-lg p-2 text-sm w-1/3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <input 
              type="text" 
              placeholder="Libellé du compte..." 
              value={newCompte.libelle}
              onChange={e => setNewCompte({...newCompte, libelle: e.target.value})}
              className="border border-slate-300 rounded-lg p-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => { if(e.key === 'Enter') handleAddCompte(); }}
            />
            <button onClick={handleAddCompte} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors" title="Ajouter le compte">
              <PlusCircle size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
          <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Rechercher un compte</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tapez un numéro ou un mot-clé..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-300 rounded-lg p-2 pl-10 text-sm w-full outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des comptes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-bold">
            <tr>
              <th className="py-3 px-4 w-32">N° de Compte</th>
              <th className="py-3 px-4">Libellé Comptable</th>
              <th className="py-3 px-4 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredComptes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                
                {/* COLONNE CODE */}
                <td className="py-2.5 px-4 font-mono">
                  {editingId === c.id ? (
                    <input 
                      type="text" 
                      value={editForm.code} 
                      onChange={e => setEditForm({...editForm, code: e.target.value.replace(/[^0-9]/g, '')})}
                      className="border border-indigo-400 bg-indigo-50 text-indigo-900 rounded px-2 py-1 w-full outline-none font-bold"
                    />
                  ) : (
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700 font-bold">
                      {c.code}
                    </span>
                  )}
                </td>

                {/* COLONNE LIBELLÉ */}
                <td className="py-2.5 px-4 text-slate-800 font-medium">
                  {editingId === c.id ? (
                    <input 
                      type="text" 
                      value={editForm.libelle} 
                      onChange={e => setEditForm({...editForm, libelle: e.target.value})}
                      className="border border-indigo-400 bg-indigo-50 text-indigo-900 rounded px-2 py-1 w-full outline-none"
                      onKeyDown={(e) => { if(e.key === 'Enter') handleSaveEdit(c.id); }}
                    />
                  ) : (
                    c.libelle
                  )}
                </td>

                {/* COLONNE ACTIONS */}
                <td className="py-2.5 px-4 text-center">
                  <div className="flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    {editingId === c.id ? (
                      <>
                        <button onClick={() => handleSaveEdit(c.id)} className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded transition-colors" title="Enregistrer">
                          <CheckCircle2 size={18} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:bg-slate-200 p-1.5 rounded transition-colors" title="Annuler">
                          <XCircle size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(c)} className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors" title="Modifier le compte">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteCompte(c.id, c.code)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors" title="Supprimer le compte">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>

              </tr>
            ))}
            {filteredComptes.length === 0 && (
              <tr>
                <td colSpan="3" className="py-8 text-center text-slate-400">
                  Aucun compte trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
