import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, 
  AlertTriangle, Building, Calendar, PieChart, Lock, FileText, 
  Download, Trash2, XCircle, Search, ChevronRight, CheckCircle2, 
  Paperclip, Plus, Sparkles, Receipt, Heart, FileSpreadsheet, 
  Package, Target, TrendingUp, Info, Euro, ChevronDown, 
  Globe, Mail, Phone, PlusCircle, Edit2 
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "cours-tom-morel-erp";

const LOGO_URL = 'https://lh3.googleusercontent.com/sitesv/AG8ngQXc96dCEFn_IAzMJapefM9CVcMYjacEj4SRG34_lJVisC1M2RC4JkeFV2b8VN30TwAnTJN-HEkeXqfMpIH6JEChx3G9H1CUQ1SZDm-NSmFVdlj6GrkzkC3KCDkK_StXgHclve-6ytuuMw4fYkWcKQqjzjQzYeMm3ScP0VIQbBepycX8NGq429QMYo05=w16383';

const PlaceholderPage = ({ title }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    <p className="text-slate-500">Cette page est en cours de construction. Le module sera bientôt disponible.</p>
  </div>
);

const InfosContact = () => (
  <div className="space-y-6 max-w-6xl mx-auto">
    <div className="bg-blue-600 p-8 rounded-xl shadow-md text-white">
      <h1 className="text-3xl font-bold mb-2">Bienvenue sur le portail du Cours Tom Morel</h1>
      <p className="text-blue-100">Retrouvez ici toutes les informations de scolarité et les plannings.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

// --- FONCTIONS UTILITAIRES GLOBALES ---
const normaliserDateFR = (rawVal) => {
  if (!rawVal) return '';
  if (rawVal instanceof Date && !isNaN(rawVal)) {
    const d = String(rawVal.getDate()).padStart(2, '0');
    const m = String(rawVal.getMonth() + 1).padStart(2, '0');
    const y = rawVal.getFullYear();
    return `${d}/${m}/${y}`;
  }
  const str = String(rawVal).trim();
  if (!str) return '';
  if (str.includes('-')) {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) { 
        const [y, m, d] = parts;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      } else { 
        let [d, m, y] = parts;
        if (y.length === 2) y = '20' + y;
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      }
    }
  }
  return str;
};

const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(montant || 0);
};

const SearchableCompteSelect = ({ value, onChange, comptesList, placeholder = "Sélectionner un compte..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeStr = (str) => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredComptes = useMemo(() => {
    if (!search.trim()) return comptesList;
    const term = normalizeStr(search);
    return comptesList.filter(c => 
      normalizeStr(c.code).includes(term) || 
      normalizeStr(c.libelle).includes(term)
    );
  }, [comptesList, search]);

  const selectedCompte = comptesList.find(c => c.code === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left border rounded-xl px-3 py-2 text-xs font-mono font-bold flex justify-between items-center transition-all bg-white shadow-2xs ${
          value ? 'border-indigo-300 bg-indigo-50/80 text-indigo-900' : 'border-slate-200 text-slate-400'
        }`}
      >
        <span className="truncate">
          {selectedCompte ? `${selectedCompte.code} - ${selectedCompte.libelle}` : (value ? `${value} (Suggéré)` : placeholder)}
        </span>
        <ChevronDown size={14} className="text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto">
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Code ou libellé (ex : AS, 616)..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-600 font-sans"
              autoFocus
            />
          </div>
          <div className="space-y-0.5">
            {filteredComptes.length > 0 ? (
              filteredComptes.map(c => (
                <div 
                  key={c.id}
                  onClick={() => {
                    onChange(c.code);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs cursor-pointer flex justify-between items-center transition-colors ${
                    c.code === value ? 'bg-indigo-100 text-indigo-950 font-extrabold' : 'hover:bg-slate-100/80 text-slate-700 font-medium'
                  }`}
                >
                  <span className="font-mono font-extrabold text-indigo-700 shrink-0">{c.code}</span>
                  <span className="truncate text-slate-600 ml-2 text-right flex-1">{c.libelle}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center py-3">Aucun compte correspondant</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ÉTAT FINANCIER (Bilan & Résultat Groupés) ---
const EtatFinancier = ({ transactionsGlobales }) => {
  
  // SÉCURITÉ : Formatage monétaire rapatrié à l'intérieur
  const formatMontant = (valeur) => {
    const num = Number(valeur);
    if (isNaN(num)) return "0,00";
    return new Intl.NumberFormat('fr-FR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(num);
  };

  const safeTransactions = transactionsGlobales || [];

  const [anneeDebut, setAnneeDebut] = useState('TOTAL');
  const [detailsOuverts, setDetailsOuverts] = useState({});
  const [comptesList, setComptesList] = useState([]);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      setComptesList(liste);
    });
    return () => unsubscribe();
  }, []);

  const toggleDetail = (categorie) => {
    setDetailsOuverts(prev => ({ ...prev, [categorie]: !prev[categorie] }));
  };

  const PREFIXES = {
    '10': 'Capital, réserves et fonds associatifs',
    '11': 'Report à nouveau',
    '12': 'Résultat de l\'exercice',
    '13': 'Subventions d\'investissement',
    '15': 'Provisions',
    '16': 'Emprunts et dettes',
    '19': 'Fonds dédiés',
    '20': 'Immobilisations incorporelles',
    '21': 'Immobilisations corporelles',
    '27': 'Autres immobilisations financières',
    '28': 'Amortissements des immobilisations',
    '31': 'Matières premières',
    '37': 'Stocks de marchandises',
    '40': 'Fournisseurs et comptes rattachés',
    '41': 'Usagers, familles et comptes rattachés',
    '42': 'Personnel et comptes rattachés',
    '43': 'Sécurité sociale et autres org. sociaux',
    '44': 'État et autres collectivités publiques',
    '46': 'Débiteurs divers et créditeurs divers',
    '47': 'Comptes transitoires ou d\'attente',
    '48': 'Comptes de régularisation',
    '51': 'Banques, établissements financiers',
    '53': 'Caisse',
    '58': 'Virements internes',
    '60': 'Achats',
    '61': 'Services extérieurs',
    '62': 'Autres services extérieurs',
    '63': 'Impôts, taxes et versements assimilés',
    '64': 'Charges de personnel',
    '65': 'Autres charges de gestion courante',
    '66': 'Charges financières',
    '67': 'Charges exceptionnelles',
    '68': 'Dotations aux amortissements',
    '70': 'Ventes de produits, prestations',
    '74': 'Subventions d\'exploitation',
    '75': 'Autres produits de gestion courante',
    '76': 'Produits financiers',
    '77': 'Produits exceptionnels',
    '78': 'Reprises sur amortissements',
    '79': 'Transferts de charges'
  };

  const getCompteLibelle = (code) => {
    const codeStr = String(code).trim();
    const c = comptesList.find(x => String(x.code).trim() === codeStr);
    if (c) return c.libelle;
    if (codeStr === '512000') return 'Banque';
    return '';
  };

  const parseDateForFilter = (dStr) => {
    if (!dStr) return 0;
    const str = String(dStr).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        return new Date(year, month, day).getTime();
      }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) { 
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
        } else { 
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
        }
      }
    }
    return new Date(str).getTime() || 0;
  };

  const { anterieures, exercice } = useMemo(() => {
    if (anneeDebut === 'TOTAL') {
      return { anterieures: [], exercice: safeTransactions };
    }

    const start = new Date(Number(anneeDebut), 8, 1, 0, 0, 0).getTime(); 
    const end = new Date(Number(anneeDebut) + 1, 7, 31, 23, 59, 59).getTime(); 

    const ant = [];
    const exo = [];

    safeTransactions.forEach(t => {
      if (!t || !t.date) return;
      const tTime = parseDateForFilter(t.date);
      if (tTime < start) ant.push(t);
      else if (tTime >= start && tTime <= end) exo.push(t);
    });

    return { anterieures: ant, exercice: exo };
  }, [safeTransactions, anneeDebut]);

  const balancesBilan = {};
  const balancesResultat = {};
  const balancesResultatAnt = {};

  const addAmount = (balancesObj, compte, deb, cred) => {
    if (!compte) return;
    const compteStr = String(compte).trim();
    if (!compteStr) return;
    
    if (!balancesObj[compteStr]) balancesObj[compteStr] = { debit: 0, credit: 0 };
    balancesObj[compteStr].debit += (Number(deb) || 0);
    balancesObj[compteStr].credit += (Number(cred) || 0);
  };

  const processTx = (t, isAnterieur) => {
    if (!t) return;
    const isOD = t.type === 'od';
    const resObj = isAnterieur ? balancesResultatAnt : balancesResultat;
    const m = Number(t.montant) || 0;
    const absM = Math.abs(m);

    if (isOD) {
      const dCode = t.compteDebit ? String(t.compteDebit).trim() : '';
      const cCode = t.compteCredit ? String(t.compteCredit).trim() : '';

      if (dCode) {
        if (dCode.startsWith('6') || dCode.startsWith('7')) {
          addAmount(resObj, dCode, absM, 0);
        } else {
          addAmount(balancesBilan, dCode, absM, 0);
        }
      }
      if (cCode) {
        if (cCode.startsWith('6') || cCode.startsWith('7')) {
          addAmount(resObj, cCode, 0, absM);
        } else {
          addAmount(balancesBilan, cCode, 0, absM);
        }
      }
    } else {
      const compteStr = t.compte ? String(t.compte).trim() : '';
      const isCharge = compteStr.startsWith('6');
      const isProduit = compteStr.startsWith('7');

      if (isCharge || isProduit) {
        if (m < 0) addAmount(resObj, compteStr, absM, 0);
        else addAmount(resObj, compteStr, 0, absM);
      } else if (compteStr) {
        if (m < 0) addAmount(balancesBilan, compteStr, absM, 0);
        else addAmount(balancesBilan, compteStr, 0, absM);
      }

      // Génération de la contrepartie en Banque 512 automatique
      if (m < 0) addAmount(balancesBilan, '512000', 0, absM); 
      else addAmount(balancesBilan, '512000', absM, 0); 
    }
  };

  anterieures.forEach(t => processTx(t, true));
  exercice.forEach(t => processTx(t, false));

  // Calcul du Résultat N-1 et injection
  let resultatAnterieur = 0;
  Object.keys(balancesResultatAnt).forEach(code => {
    const b = balancesResultatAnt[code];
    if (code.startsWith('7')) resultatAnterieur += (b.credit - b.debit);
    if (code.startsWith('6')) resultatAnterieur -= (b.debit - b.credit);
  });

  if (Math.abs(resultatAnterieur) > 0.01) {
    if (resultatAnterieur > 0) addAmount(balancesBilan, '120000', 0, Math.abs(resultatAnterieur)); 
    else addAmount(balancesBilan, '120000', Math.abs(resultatAnterieur), 0); 
  }

  const actif = {};
  const passif = {};
  const charges = {};
  const produits = {};

  let totalActif = 0;
  let totalPassif = 0;
  let totalCharges = 0;
  let totalProduits = 0;

  const addToGroup = (category, code, val) => {
    const prefix2 = code.substring(0, 2);
    const groupName = `${prefix2} - ${PREFIXES[prefix2] || 'Autres comptes'}`;
    if (!category[groupName]) category[groupName] = { total: 0, items: [] };
    category[groupName].items.push({ code, libelle: getCompteLibelle(code), net: val });
    category[groupName].total += val;
  };

  // Traitement strict des soldes comptables
  Object.keys(balancesBilan).forEach(code => {
    if (!code || code.length < 2) return;
    const b = balancesBilan[code];
    
    const soldeDebit = b.debit - b.credit;
    const soldeCredit = b.credit - b.debit;
    
    if (Math.abs(soldeDebit) < 0.01) return;

    const root = code[0];
    if (['1'].includes(root)) {
      addToGroup(passif, code, soldeCredit); 
      totalPassif += soldeCredit;
    } else if (['2', '3'].includes(root)) {
      addToGroup(actif, code, soldeDebit);
      totalActif += soldeDebit;
    } else if (['4', '5'].includes(root)) {
      if (soldeDebit > 0) {
        addToGroup(actif, code, soldeDebit);
        totalActif += soldeDebit;
      } else {
        addToGroup(passif, code, soldeCredit);
        totalPassif += soldeCredit;
      }
    }
  });

  Object.keys(balancesResultat).forEach(code => {
    if (!code || code.length < 2) return;
    const b = balancesResultat[code];
    const soldeDebit = b.debit - b.credit;
    const soldeCredit = b.credit - b.debit;
    
    if (Math.abs(soldeDebit) < 0.01) return;

    const root = code[0];
    if (root === '6') {
      addToGroup(charges, code, soldeDebit);
      totalCharges += soldeDebit;
    } else if (root === '7') {
      addToGroup(produits, code, soldeCredit);
      totalProduits += soldeCredit;
    }
  });

  const sortGroupItems = (groupObj) => {
    Object.keys(groupObj).forEach(key => {
      groupObj[key].items.sort((a, b) => a.code.localeCompare(b.code));
    });
  };
  sortGroupItems(actif);
  sortGroupItems(passif);
  sortGroupItems(charges);
  sortGroupItems(produits);

  const resultat = totalProduits - totalCharges;
  const sortedKeys = (obj) => Object.keys(obj).sort();

  const totalPassifPlusResultat = totalPassif + resultat;
  const ecartBilan = Math.abs(totalActif - totalPassifPlusResultat);
  const isBilanDesequilibre = ecartBilan > 0.01;

  const renderGroup = (category, groupKey) => {
    const grp = category[groupKey];
    if (!grp) return null;
    const isExpanded = detailsOuverts[groupKey];
    return (
      <div key={groupKey} className="border-b border-slate-100 last:border-0">
        <div 
          className="flex justify-between items-center p-3 hover:bg-slate-50 cursor-pointer transition-colors"
          onClick={() => toggleDetail(groupKey)}
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={14} className="text-slate-400 shrink-0" /> : <ChevronRight size={14} className="text-slate-400 shrink-0" />}
            <span className="text-sm font-semibold text-slate-700">{groupKey}</span>
          </div>
          <span className="text-sm font-bold text-slate-800 whitespace-nowrap ml-2">{formatMontant(grp.total)} €</span>
        </div>
        {isExpanded && (
          <div className="bg-slate-50 pb-2">
            {grp.items.map(item => (
              <div key={item.code} className="flex justify-between items-center px-8 py-1.5 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <span className="text-[11px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 shrink-0">{item.code}</span>
                  <span className="text-xs text-slate-600 truncate" title={item.libelle}>
                    {item.libelle || <span className="italic text-slate-400">Sans libellé</span>}
                  </span>
                </div>
                <span className={`text-xs font-medium shrink-0 ${item.net < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {formatMontant(item.net)} €
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-indigo-600" /> États Financiers
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {anneeDebut === 'TOTAL' ? 'Bilan consolidé de toutes les écritures enregistrées.' : 'Bilan et Compte de Résultat groupés par familles comptables.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar size={18} className="text-slate-500" />
          <select 
            value={anneeDebut} 
            onChange={(e) => setAnneeDebut(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="TOTAL" className="font-bold text-indigo-700">⭐ Bilan Total (Toutes années)</option>
            <option disabled>──────────────</option>
            {[2021, 2022, 2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>
                01/09/{String(year).slice(-2)} au 31/08/{String(year + 1).slice(-2)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {anneeDebut !== 'TOTAL' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-4">
            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
              Compte de Résultat (Classe 6 & 7)
            </h3>
            <p className="text-slate-400 text-xs mt-1">Compare les produits et les charges pour déterminer le bénéfice ou la perte.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div>
              <div className="bg-red-50 text-red-700 font-bold p-3 text-center text-sm border-b border-red-100 uppercase tracking-wider">
                Charges (Dépenses)
              </div>
              <div className="p-2">
                {sortedKeys(charges).length > 0 ? (
                  sortedKeys(charges).map(key => renderGroup(charges, key))
                ) : (
                  <div className="text-center text-slate-400 text-sm py-8">Aucune donnée sur cette période</div>
                )}
              </div>
            </div>
            <div>
              <div className="bg-emerald-50 text-emerald-700 font-bold p-3 text-center text-sm border-b border-emerald-100 uppercase tracking-wider">
                Produits (Recettes)
              </div>
              <div className="p-2">
                {sortedKeys(produits).length > 0 ? (
                  sortedKeys(produits).map(key => renderGroup(produits, key))
                ) : (
                  <div className="text-center text-slate-400 text-sm py-8">Aucune donnée sur cette période</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-700 uppercase">Résultat de l'exercice</span>
            <span className={`text-xl font-black ${resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {resultat > 0 ? '+' : ''}{formatMontant(Math.abs(resultat))} €
            </span>
          </div>
        </div>
      )}

      {isBilanDesequilibre && (
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start gap-4 animate-pulse">
          <div className="p-3 bg-rose-500 text-white rounded-xl shadow-md shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="font-black text-rose-900 text-lg uppercase tracking-tight">Déséquilibre du Bilan Détecté</h4>
            <p className="text-sm text-rose-800 mt-1 leading-relaxed">
              En comptabilité, l'Actif doit toujours être égal au Passif (incluant le Résultat). 
              Écart actuel : <strong className="bg-rose-200 px-1.5 py-0.5 rounded">{formatMontant(ecartBilan)} €</strong>.
            </p>
            <div className="bg-white/60 border border-rose-100 p-3 rounded-xl mt-3 flex items-start gap-2">
              <span className="text-rose-600 font-bold">💡 Solution :</span>
              <span className="text-xs text-rose-900 font-medium">Vérifiez que toutes vos écritures bancaires sont imputées ou que vos Opérations Diverses sont parfaitement équilibrées.</span>
            </div>
          </div>
        </div>
      )}

      {/* ICI LE BUG ÉTAIT PRÉSENT : Le nom de la variable a été corrigé en safeTransactions */}
      {!isBilanDesequilibre && safeTransactions.length > 0 && anneeDebut === 'TOTAL' && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-emerald-500 text-white rounded-lg shadow-md shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-sm text-emerald-800 font-medium">
            Excellente nouvelle ! Votre Bilan Total est <strong>parfaitement équilibré</strong> au centime près. L'Actif correspond exactement au Passif.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-4">
          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
            Bilan Comptable (Classe 1 à 5)
          </h3>
          <p className="text-slate-400 text-xs mt-1">Photographie du patrimoine : L'Actif (ce qu'on possède) et le Passif (ce qu'on doit).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div>
            <div className="bg-blue-50 text-blue-700 font-bold p-3 text-center text-sm border-b border-blue-100 uppercase tracking-wider">
              Actif (Emplois)
            </div>
            <div className="p-2">
              {sortedKeys(actif).length > 0 ? (
                sortedKeys(actif).map(key => renderGroup(actif, key))
              ) : (
                <div className="text-center text-slate-400 text-sm py-8">Aucune donnée sur cette période</div>
              )}
            </div>
          </div>
          <div>
            <div className="bg-orange-50 text-orange-700 font-bold p-3 text-center text-sm border-b border-orange-100 uppercase tracking-wider">
              Passif (Ressources)
            </div>
            <div className="p-2">
              {sortedKeys(passif).length > 0 ? (
                sortedKeys(passif).map(key => renderGroup(passif, key))
              ) : (
                <div className="text-center text-slate-400 text-sm py-8">Aucune donnée sur cette période</div>
              )}
              <div className="border-t border-slate-200 mt-2 pt-2">
                <div className="flex justify-between items-center px-4 py-2 bg-slate-50 rounded-lg">
                  <span className="text-sm font-bold text-slate-700">
                    12 - {anneeDebut === 'TOTAL' ? 'Résultat Global (Cumulé)' : "Résultat de l'exercice"}
                  </span>
                  <span className={`text-sm font-black ${resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {resultat > 0 ? '+' : ''}{formatMontant(Math.abs(resultat))} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-between items-center text-sm ${isBilanDesequilibre ? 'bg-rose-100 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
          <span className={`font-black uppercase ${isBilanDesequilibre ? 'text-rose-700' : 'text-slate-500'}`}>TOTAL GÉNÉRAL</span>
          <div className="flex gap-8">
            <span className="font-bold text-blue-700">Actif : {formatMontant(totalActif)} €</span>
            <span className="font-bold text-orange-700">Passif + Résultat : {formatMontant(totalPassifPlusResultat)} €</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- GRAND LIVRE (Import CSV/XLSX, OD, Validations) ---
const GrandLivre = ({ transactionsGlobales }) => {
  const [lignesEnAttente, setLignesEnAttente] = useState([]);
  const [comptesList, setComptesList] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [lastImportBatch, setLastImportBatch] = useState(null);

  const [selectedTxForPdf, setSelectedTxForPdf] = useState(null);
  const fileInputPdfRef = useRef(null);

  const [showCompteModal, setShowCompteModal] = useState(false);
  const [pendingCompte, setPendingCompte] = useState({ code: '', libelle: '', lineId: null });

  const [activeTab, setActiveTab] = useState(null);

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

  const fileInputBankRef = useRef(null);
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

  const getClasseLabel = (code) => {
    if (!code) return '';
    const root = code[0];
    const map = {
      '1': 'Classe 1 — Capitaux & Fonds propres',
      '2': 'Classe 2 — Immobilisations',
      '3': 'Classe 3 — Stocks',
      '4': 'Classe 4 — Tiers (Usagers, Fournisseurs, Personnel)',
      '5': 'Classe 5 — Trésorerie & Banques',
      '6': 'Classe 6 — Charges (Dépenses)',
      '7': 'Classe 7 — Produits (Recettes)'
    };
    return map[root] || 'Compte Général';
  };

  const handleCompteOdBlur = (lineId, rawCode) => {
    if (!rawCode) return;
    const cleanCode = rawCode.trim().replace(/[^0-9]/g, '');

    if (cleanCode.length >= 6) {
      const exists = comptesList.some(c => c.code === cleanCode);
      if (!exists) {
        setPendingCompte({ code: cleanCode, libelle: '', lineId });
        setShowCompteModal(true);
      } else {
        setOdLines(prev => prev.map(l => l.id === lineId ? { ...l, compte: cleanCode } : l));
      }
    }
  };

  const handleSaveNewCompteFromModal = async () => {
    if (!pendingCompte.code || pendingCompte.code.length < 6) {
      alert("Le numéro de compte doit contenir au moins 6 chiffres.");
      return;
    }
    if (!pendingCompte.libelle.trim()) {
      alert("Veuillez saisir un libellé pour ce compte.");
      return;
    }

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comptes'), {
        code: pendingCompte.code,
        libelle: pendingCompte.libelle.trim()
      });

      if (pendingCompte.lineId) {
        setOdLines(prev => prev.map(l => l.id === pendingCompte.lineId ? { ...l, compte: pendingCompte.code } : l));
      }

      setShowCompteModal(false);
      setPendingCompte({ code: '', libelle: '', lineId: null });
    } catch (e) {
      alert("Erreur lors de la création du compte.");
    }
  };

  const handleTriggerPdf = (txId) => {
    setSelectedTxForPdf(txId);
    if (fileInputPdfRef.current) fileInputPdfRef.current.click();
  };

  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedTxForPdf) return;

    if (file.size > 3 * 1024 * 1024) {
      alert("Le fichier est trop volumineux (maximum 3 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', selectedTxForPdf), {
          pdfData: base64Data,
          pdfName: file.name
        });
      } catch (err) {
        alert("Erreur lors de l'enregistrement du document.");
      }
      setSelectedTxForPdf(null);
      if (fileInputPdfRef.current) fileInputPdfRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleResetGrandLivre = async () => {
    if (transactionsGlobales.length === 0) return alert("Le Grand Livre est déjà vide.");

    const pwd = window.prompt("⚠️ DANGER : Vous allez supprimer TOUTES les écritures validées du Grand Livre.\n\nVeuillez entrer le mot de passe administrateur pour confirmer :");

    if (pwd === 'admin123') {
      const confirm = window.confirm(`Êtes-vous absolument sûr ? ${transactionsGlobales.length} écritures vont être définitivement effacées.`);
      if (confirm) {
        try {
          for (const tx of transactionsGlobales) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id));
          }
          alert("Le Grand Livre a été entièrement vidé avec succès.");
        } catch (e) {
          alert("Erreur lors de la suppression du Grand Livre.");
        }
      }
    } else if (pwd !== null) {
      alert("Mot de passe incorrect. Annulation de la suppression.");
    }
  };

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

  const parseMontant = (rawVal) => {
    if (rawVal === undefined || rawVal === null || rawVal === '') return 0;
    if (typeof rawVal === 'number') return rawVal;
    let s = String(rawVal).replace(/[\s\u00A0\u202F]/g, '');
    if (s.includes(',') && s.includes('.')) {
      if (s.indexOf(',') < s.indexOf('.')) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(/\./g, '').replace(',', '.');
      }
    } else if (s.includes(',')) {
      s = s.replace(/,/g, '.');
    }
    return parseFloat(s) || 0;
  };

  const handleUndoLastImport = async () => {
    if (!lastImportBatch) return;
    if (!window.confirm(`Voulez-vous vraiment annuler le dernier import de ${lastImportBatch.source} (${lastImportBatch.count} lignes) ?`)) return;

    if (lastImportBatch.target === 'sas') {
      setLignesEnAttente(prev => prev.filter(l => l.batchId !== lastImportBatch.batchId));
      alert("L'import a été annulé et retiré de la liste d'attente.");
    } else if (lastImportBatch.target === 'firestore') {
      const txToDelete = transactionsGlobales.filter(t => t.batchId === lastImportBatch.batchId);
      for (const tx of txToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', tx.id));
      }
      alert(`L'import a été annulé (${txToDelete.length} écritures ont été retirées du Grand Livre).`);
    }
    setLastImportBatch(null);
  };

  const handleImportBank = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const batchId = 'batch_' + Date.now();
    let doublonsCount = 0;

    const processRows = (lignesBrutes) => {
      const nouvellesLignes = [];
      for (let i = 0; i < lignesBrutes.length; i++) {
        const cols = lignesBrutes[i];
        if (cols.length >= 6) {
          const debit = parseMontant(cols[5]);
          const credit = parseMontant(cols[6]);
          let mt = 0;
          if (cols[6] !== undefined && cols[6] !== '') {
            mt = credit !== 0 ? Math.abs(credit) : -Math.abs(debit);
          } else {
            mt = debit;
          }

          const dateExtrait = normaliserDateFR(cols[0]);
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
              batchId: batchId,
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

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split('\n');
        const lignesBrutes = lines.slice(1).map(line => line.split(';').map(c => c.trim().replace(/"/g, '')));
        const resultat = processRows(lignesBrutes);
        setLignesEnAttente(prev => [...prev, ...resultat]);
        if (resultat.length > 0) setLastImportBatch({ batchId, target: 'sas', source: 'Journal de Banque', count: resultat.length });
        alert(`${resultat.length} ligne(s) importée(s) avec succès.${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
      };
      reader.readAsText(file, 'ISO-8859-1');
    } else if (ext === 'xlsx') {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: '' });
        const resultat = processRows(rows.slice(1));
        setLignesEnAttente(prev => [...prev, ...resultat]);
        if (resultat.length > 0) setLastImportBatch({ batchId, target: 'sas', source: 'Journal de Banque', count: resultat.length });
        alert(`${resultat.length} ligne(s) importée(s) avec succès.${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
      } catch (err) {
        alert("Erreur lors de la lecture du fichier XLSX.");
      }
    }
    if (fileInputBankRef.current) fileInputBankRef.current.value = '';
    setActiveTab(null);
  };

  const handleImportPaie = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const batchId = 'batch_' + Date.now();

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
          const formattedDate = normaliserDateFR(rawDate);
          const compteNum = cols[4].trim();
          const compteLib = cols[5].trim();
          const pieceRef = cols[8].trim();
          const ecritureLib = cols[10].trim();
          const debit = parseMontant(cols[11]);
          const credit = parseMontant(cols[12]);

          if (debit > 0 || credit > 0) {
            const libelleFinal = `(PAIE) ${ecritureLib} - ${compteLib}`;
            const mt = debit > 0 ? debit : credit;

            const isDuplicate = transactionsGlobales.some(t => t.date === formattedDate && t.libelle === libelleFinal && Math.abs(t.montant) === Math.abs(mt));

            if (isDuplicate) {
              doublonsCount++;
              continue;
            }

            const newTx = {
              batchId: batchId, 
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
      if (count > 0) setLastImportBatch({ batchId, target: 'firestore', source: 'Fiches de Paie', count });
      alert(`${count} ligne(s) de paie intégrée(s) !${doublonsCount > 0 ? `\n(Sécurité : ${doublonsCount} doublon(s) ignoré(s))` : ''}`);
      if (fileInputPaieRef.current) fileInputPaieRef.current.value = '';
      setActiveTab(null);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImportODMass = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const batchId = 'batch_' + Date.now();

    const processRows = async (rows) => {
      let count = 0;
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols && cols.length >= 9) {
          const rawDate = cols[0];
          const journal = String(cols[2] || '').trim().toUpperCase();
          const compteNum = String(cols[3] || '').trim();
          const pieceRef = cols[5] || '';
          const libelle = cols[6] || '';

          let debitVal = parseMontant(cols[7]);
          let creditVal = parseMontant(cols[8]);
          const commentaire = cols[11] || '';

          if (debitVal < 0) {
            creditVal = Math.abs(debitVal);
            debitVal = 0;
          } else if (creditVal < 0) {
            debitVal = Math.abs(creditVal);
            creditVal = 0;
          }

          if (rawDate && libelle && (debitVal !== 0 || creditVal !== 0)) {
            const formattedDate = normaliserDateFR(rawDate);
            const isDebit = debitVal > 0;
            const montantFinal = isDebit ? debitVal : creditVal;
            const prefix = journal === 'PAIE' ? '(PAIE)' : '(OD)';

            const newTx = {
              batchId: batchId,
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
      if (count > 0) setLastImportBatch({ batchId, target: 'firestore', source: 'Opérations Diverses', count });
      alert(`${count} lignes importées avec succès dans le Grand Livre !`);
      if (fileInputODRef.current) fileInputODRef.current.value = '';
      setActiveTab(null);
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
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: true, defval: '' });
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
      date: normaliserDateFR(ligne.date),
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
      const dateFormatted = normaliserDateFR(odFormDate);
      for (const line of odLines) {
        const debit = parseFloat(line.debit) || 0;
        const credit = parseFloat(line.credit) || 0;
        if (debit > 0 || credit > 0) {
          const newTx = {
            date: dateFormatted,
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
      setActiveTab(null);
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
    const str = String(dStr).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      if (parts.length === 3) {
        let day = parseInt(parts[0], 10);
        let month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        return new Date(year, month, day).getTime();
      }
    } else if (str.includes('-')) {
      const parts = str.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
      }
    }
    return new Date(str).getTime() || 0;
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
        const getSource = (tx) => tx.type === 'od' ? (tx.typeOp === 'PAIE' || tx.libelle?.includes('(PAIE)') ? 'paie' : 'od') : 'banque';
        valA = getSource(a);
        valB = getSource(b);
      } else if (sortConfig.key === 'date') {
        valA = parseDateForSort(a.date);
        valB = parseDateForSort(b.date);
      } else if (sortConfig.key === 'debit') {
        valA = a.type === 'od' ? (a.compteDebit ? Number(a.montant) || 0 : 0) : (Number(a.montant) < 0 ? Math.abs(Number(a.montant)) : 0);
        valB = b.type === 'od' ? (b.compteDebit ? Number(b.montant) || 0 : 0) : (Number(b.montant) < 0 ? Math.abs(Number(b.montant)) : 0);
      } else if (sortConfig.key === 'credit') {
        valA = a.type === 'od' ? (a.compteCredit ? Number(a.montant) || 0 : 0) : (Number(a.montant) > 0 ? Number(a.montant) : 0);
        valB = b.type === 'od' ? (b.compteCredit ? Number(b.montant) || 0 : 0) : (Number(b.montant) > 0 ? Number(b.montant) : 0);
      } else if (sortConfig.key === 'compte') {
        valA = a.compte || a.compteDebit || a.compteCredit || '';
        valB = b.compte || b.compteDebit || b.compteCredit || '';
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

  const totalGeneralDebit = transactionsGlobales.reduce((acc, t) => {
    if (t.type === 'od') return acc + (t.compteDebit ? Number(t.montant) || 0 : 0);
    return acc + (Number(t.montant) < 0 ? Math.abs(Number(t.montant)) : 0);
  }, 0);

  const totalGeneralCredit = transactionsGlobales.reduce((acc, t) => {
    if (t.type === 'od') return acc + (t.compteCredit ? Number(t.montant) || 0 : 0);
    return acc + (Number(t.montant) > 0 ? Number(t.montant) : 0);
  }, 0);

  return (
    <div className="space-y-6 w-full max-w-[1600px] mx-auto px-3 py-2 font-sans">

      {/* INPUTS CACHÉS */}
      <input type="file" accept="application/pdf,image/*" className="hidden" ref={fileInputPdfRef} onChange={handlePdfChange} />
      <input type="file" accept=".csv,.xlsx" className="hidden" ref={fileInputBankRef} onChange={handleImportBank} />
      <input type="file" accept=".txt,.tsv" className="hidden" ref={fileInputPaieRef} onChange={handleImportPaie} />
      <input type="file" accept=".csv,.xlsx" className="hidden" ref={fileInputODRef} onChange={handleImportODMass} />

      {/* MODAL CRÉATION DE COMPTE */}
      {showCompteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-purple-100 w-full max-w-md overflow-hidden transition-all scale-100">
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Sparkles size={22} className="text-purple-200" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Nouveau compte comptable</h3>
                  <p className="text-purple-200 text-xs mt-0.5">Création automatique dans le Plan Comptable</p>
                </div>
              </div>
              <button onClick={() => setShowCompteModal(false)} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Classification PCG</span>
                <span className="text-xs font-extrabold text-purple-900 bg-purple-200/70 px-3 py-1 rounded-lg">
                  {getClasseLabel(pendingCompte.code)}
                </span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Code Compte (6 chiffres min.)</label>
                <input type="text" value={pendingCompte.code} onChange={e => setPendingCompte({ ...pendingCompte, code: e.target.value.replace(/[^0-9]/g, '') })} className="w-full border border-slate-200 rounded-2xl p-3 text-base font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-600 bg-slate-50/50" placeholder="ex: 618500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Libellé officiel</label>
                <input type="text" value={pendingCompte.libelle} onChange={e => setPendingCompte({ ...pendingCompte, libelle: e.target.value })} placeholder="ex: Abonnements Logiciels & SaaS" className="w-full border border-slate-200 rounded-2xl p-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-purple-600" autoFocus onKeyDown={e => { if(e.key === 'Enter') handleSaveNewCompteFromModal(); }} />
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowCompteModal(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors">Annuler</button>
              <button onClick={handleSaveNewCompteFromModal} disabled={pendingCompte.code.length < 6 || !pendingCompte.libelle.trim()} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2 ${pendingCompte.code.length >= 6 && pendingCompte.libelle.trim() ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-200 cursor-pointer' : 'bg-purple-300 cursor-not-allowed shadow-none'}`}>
                <CheckCircle2 size={16} /> Créer & Affecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EN-TÊTE DASHBOARD COMPTABLE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <BookOpen size={24} />
            </span>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Grand Livre Comptable</h2>
              <p className="text-indigo-200/70 text-xs md:text-sm mt-0.5">Console d'importation, ventilation des OD et suivi analytique.</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-indigo-200/80 tracking-wider">Écritures enregistrées</span>
            <span className="text-lg font-black text-white">{transactionsGlobales.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">Total Débit</span>
            <span className="text-lg font-black text-rose-300">{formatMontant(totalGeneralDebit)} €</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Total Crédit</span>
            <span className="text-lg font-black text-emerald-300">{formatMontant(totalGeneralCredit)} €</span>
          </div>
        </div>
      </div>

      {lastImportBatch && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/60 text-amber-950 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
              <AlertTriangle size={18} />
            </span>
            <span className="text-sm font-semibold">Dernier import : <strong>{lastImportBatch.source}</strong> ({lastImportBatch.count} lignes).</span>
          </div>
          <button onClick={handleUndoLastImport} className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm">
            <XCircle size={16} className="text-amber-600" /> Annuler cet import
          </button>
        </div>
      )}

      {/* PANNEAUX D'ACTIONS : DISPOSITION HORIZONTALE COMPACTE CÔTE À CÔTE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ONGLET BANQUE */}
        <div className={`bg-white border rounded-3xl shadow-sm flex flex-col transition-all overflow-hidden ${activeTab === 'banque' ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-200/80 hover:border-indigo-300'}`}>
          <button onClick={() => setActiveTab(activeTab === 'banque' ? null : 'banque')} className={`w-full text-left p-5 flex justify-between items-center transition-colors ${activeTab === 'banque' ? 'bg-indigo-50/50' : 'hover:bg-slate-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'banque' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-indigo-50 text-indigo-600'}`}>
                <Download size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base ${activeTab === 'banque' ? 'text-indigo-950' : 'text-slate-800'}`}>Journal de Banque</h3>
                <p className="text-xs text-slate-500 mt-0.5">Import des relevés</p>
              </div>
            </div>
            <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${activeTab === 'banque' ? 'rotate-180 text-indigo-600' : ''}`} />
          </button>
          {activeTab === 'banque' && (
            <div className="p-5 pt-0 animate-fade-in flex-1 flex flex-col justify-end">
              <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex flex-col gap-4 text-center mt-4">
                <p className="text-xs text-indigo-900 leading-relaxed">Formats acceptés : <strong>.CSV</strong> ou <strong>.XLSX</strong>.</p>
                <button onClick={() => fileInputBankRef.current.click()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-200 active:scale-95">
                  <Download size={16} /> Parcourir le fichier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ONGLET PAIE */}
        <div className={`bg-white border rounded-3xl shadow-sm flex flex-col transition-all overflow-hidden ${activeTab === 'paie' ? 'border-pink-400 ring-4 ring-pink-50' : 'border-slate-200/80 hover:border-pink-300'}`}>
          <button onClick={() => setActiveTab(activeTab === 'paie' ? null : 'paie')} className={`w-full text-left p-5 flex justify-between items-center transition-colors ${activeTab === 'paie' ? 'bg-pink-50/50' : 'hover:bg-slate-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'paie' ? 'bg-pink-600 text-white shadow-md shadow-pink-200' : 'bg-pink-50 text-pink-600'}`}>
                <Users size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base ${activeTab === 'paie' ? 'text-pink-950' : 'text-slate-800'}`}>Fiches de Paie</h3>
                <p className="text-xs text-slate-500 mt-0.5">Intégration du journal des salaires</p>
              </div>
            </div>
            <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${activeTab === 'paie' ? 'rotate-180 text-pink-600' : ''}`} />
          </button>
          {activeTab === 'paie' && (
            <div className="p-5 pt-0 animate-fade-in flex-1 flex flex-col justify-end">
              <div className="bg-pink-50/50 rounded-2xl p-4 border border-pink-100 flex flex-col gap-4 text-center mt-4">
                <p className="text-xs text-pink-900 leading-relaxed">Formats acceptés : <strong>.TXT</strong> ou <strong>.TSV</strong>.<br/>Import de votre logiciel de paie externe.</p>
                <button onClick={() => fileInputPaieRef.current.click()} className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-pink-200 active:scale-95">
                  <Users size={16} /> Sélectionner le fichier
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ONGLET OD */}
        <div className={`bg-white border rounded-3xl shadow-sm flex flex-col transition-all overflow-hidden lg:col-span-1 md:col-span-2 ${activeTab === 'od' ? 'border-purple-400 ring-4 ring-purple-50 lg:col-span-3' : 'border-slate-200/80 hover:border-purple-300'}`}>
          <button onClick={() => setActiveTab(activeTab === 'od' ? null : 'od')} className={`w-full text-left p-5 flex justify-between items-center transition-colors ${activeTab === 'od' ? 'bg-purple-50/50' : 'hover:bg-slate-50/50'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === 'od' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'bg-purple-50 text-purple-600'}`}>
                <FileText size={20} />
              </div>
              <div>
                <h3 className={`font-extrabold text-base ${activeTab === 'od' ? 'text-purple-950' : 'text-slate-800'}`}>Opération Diverse</h3>
                <p className="text-xs text-slate-500 mt-0.5">Saisie ou Import masse</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={(e) => { e.stopPropagation(); fileInputODRef.current.click(); }} className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm" title="Importer un fichier d'OD ou de Paie en masse (.csv / .xlsx)">
                <Download size={13}/> Import masse
              </button>
              <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${activeTab === 'od' ? 'rotate-180 text-purple-600' : ''}`} />
            </div>
          </button>
          
          {activeTab === 'od' && (
            <div className="p-5 pt-0 animate-fade-in bg-purple-50/30">
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <input type="date" value={odFormDate} onChange={e => setOdFormDate(e.target.value)} className="w-1/3 border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600 font-mono font-semibold shadow-sm" />
                    <input type="text" placeholder="Libellé OD..." value={odFormLibelle} onChange={e => setOdFormLibelle(e.target.value)} className="flex-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600 font-medium shadow-sm" />
                  </div>
                  <input type="text" placeholder="Commentaire ou référence optionnelle..." value={odFormCommentaire} onChange={e => setOdFormCommentaire(e.target.value)} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-purple-600 shadow-sm" />
                </div>

                <div className="space-y-3 mt-2">
                  {odLines.map((l) => (
                    <div key={l.id} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-full md:flex-1 relative">
                        <SearchableCompteSelect 
                          value={l.compte || ''}
                          comptesList={comptesList}
                          placeholder="Sélectionnez ou tapez (ex: 606100)"
                          onChange={(val) => updateOdLine(l.id, 'compte', val)}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-8 pointer-events-none opacity-0">
                          <input type="text" className="hidden" value={l.compte} onBlur={e => handleCompteOdBlur(l.id, e.target.value)} />
                        </div>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <input type="number" placeholder="Débit €" value={l.debit} onChange={e => updateOdLine(l.id, 'debit', e.target.value)} className="border border-slate-200 rounded-xl p-2 text-sm bg-slate-50 w-full md:w-32 outline-none focus:ring-2 focus:ring-purple-600 font-bold text-right" />
                        <input type="number" placeholder="Crédit €" value={l.credit} onChange={e => updateOdLine(l.id, 'credit', e.target.value)} className="border border-slate-200 rounded-xl p-2 text-sm bg-slate-50 w-full md:w-32 outline-none focus:ring-2 focus:ring-purple-600 font-bold text-right" />
                        <button onClick={() => removeOdLine(l.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-slate-100 rounded-xl shrink-0"><XCircle size={18} /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addOdLine} className="text-sm text-purple-600 font-bold hover:underline flex items-center gap-1 p-1 ml-1">+ Ajouter une ligne de ventilation</button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-purple-200/50 mt-2">
                  <div className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border w-full sm:w-auto justify-between sm:justify-start transition-colors ${isOdBalanced ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    <span className="uppercase text-xs font-bold tracking-wider">Équilibre</span>
                    <div className="flex gap-4 font-mono text-sm">
                      <span className={isOdBalanced ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-bold'}>D: {formatMontant(totalDebitOD)} €</span>
                      <span className={isOdBalanced ? 'text-emerald-700 font-extrabold' : 'text-rose-600 font-bold'}>C: {formatMontant(totalCreditOD)} €</span>
                    </div>
                  </div>

                  <button onClick={handleAddOD} disabled={!isOdBalanced} className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${isOdBalanced ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200 cursor-pointer active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}>
                    <CheckCircle2 size={16} /> Enregistrer l'OD
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SAS D'IMPUTATION BANCAIRE */}
      {lignesEnAttente.length > 0 && (
        <div className="bg-orange-50/80 p-6 rounded-3xl border border-orange-200/80 shadow-sm animate-fade-in">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-orange-500 text-white rounded-2xl shadow-sm"><AlertTriangle size={20} /></span>
              <div>
                <h3 className="font-extrabold text-orange-950 text-base">Lignes bancaires à imputer ({lignesEnAttente.length})</h3>
                <p className="text-xs text-orange-800/80">Recherche par numéro de compte ou par mot-clé (ex : AS, loyer, banque).</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {nbLignesPretes > 0 && (
                <button onClick={() => { lignesEnAttente.forEach(l => { if(l.comptePropose) validerLigneBank(l.id, l.comptePropose, l.commentaire); }); }} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md shadow-emerald-200">
                  <CheckCircle2 size={16} /> Tout Valider ({nbLignesPretes})
                </button>
              )}
              <button onClick={() => setLignesEnAttente([])} className="text-xs bg-white border border-orange-300 hover:bg-orange-100 text-orange-900 px-3.5 py-2.5 rounded-xl font-bold transition-colors">
                <XCircle size={15} /> Vider la liste
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-orange-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-orange-100/50 text-orange-950 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Libellé</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4">Commentaire</th>
                  <th className="py-3 px-4 min-w-[280px]">Compte comptable (Recherchable)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {lignesEnAttente.map((ligne) => (
                  <tr key={ligne.id} className="hover:bg-orange-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 whitespace-nowrap">{normaliserDateFR(ligne.date)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800 truncate max-w-xs">{ligne.libelle}</td>
                    <td className={`py-3 px-4 text-right font-extrabold font-mono whitespace-nowrap ${ligne.montant > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {ligne.montant > 0 ? '+' : ''}{formatMontant(Math.abs(ligne.montant))} €
                    </td>
                    <td className="py-3 px-4">
                      <input type="text" placeholder="Ajouter un commentaire..." value={ligne.commentaire || ''} onChange={(e) => { const val = e.target.value; setLignesEnAttente(prev => prev.map(l => l.id === ligne.id ? { ...l, commentaire: val } : l)); }} className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs w-full outline-none focus:border-indigo-500 bg-slate-50/50" />
                    </td>
                    <td className="py-3 px-4 min-w-[280px]">
                      <SearchableCompteSelect value={ligne.comptePropose || ''} comptesList={comptesList} onChange={(val) => { setLignesEnAttente(prev => prev.map(l => (l.id === ligne.id || l.libelle === ligne.libelle) ? { ...l, comptePropose: val } : l )); }} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => validerLigneBank(ligne.id, ligne.comptePropose, ligne.commentaire)} disabled={!ligne.comptePropose} className={`p-2 rounded-xl transition-all shadow-sm ${ligne.comptePropose ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                          <CheckCircle2 size={16} />
                        </button>
                        <button onClick={() => setLignesEnAttente(prev => prev.filter(l => l.id !== ligne.id))} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={16} />
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

      {/* TABLEAU GRAND LIVRE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden mt-8">
        <div className="p-5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl"><CheckCircle2 size={18} /></span>
            <h3 className="font-extrabold text-slate-800 text-base">Écritures Validées au Grand Livre</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button onClick={handleResetGrandLivre} className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95" title="Vider entièrement le Grand Livre">
              <Trash2 size={14} /> Vider le Grand Livre
            </button>

            <select value={selectedCompteFilter} onChange={(e) => setSelectedCompteFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white outline-none focus:ring-2 focus:ring-indigo-600 font-mono font-bold text-slate-700 shadow-sm">
              <option value="">Tous les comptes (Filtre...)</option>
              {comptesList.map(c => <option key={`filter-${c.id}`} value={c.code}>{c.code} - {c.libelle}</option>)}
            </select>

            {selectedCompteFilter && (
              <button onClick={() => setSelectedCompteFilter('')} className="text-xs text-indigo-600 font-bold hover:underline">Réinitialiser</button>
            )}

            <div className="relative flex-1 md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Rechercher écriture..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-600 outline-none bg-white shadow-sm" />
            </div>

            <span className="text-xs font-bold bg-slate-200/60 px-3 py-2 rounded-xl text-slate-700 shadow-inner whitespace-nowrap">
              {filteredAndSortedTransactions.length} écritures
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-xs text-left min-w-max">
            <thead className="bg-slate-100/70 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider sticky top-0 backdrop-blur-md shadow-sm z-10">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors whitespace-nowrap" onClick={() => handleSort('date')}>
                  <div className="flex items-center gap-1">Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-3 text-slate-400">ID</th>
                <th className="py-3.5 px-3 cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('source')}>
                  <div className="flex items-center gap-1">Source {sortConfig.key === 'source' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors min-w-[220px]" onClick={() => handleSort('libelle')}>
                  <div className="flex items-center gap-1">Libellé {sortConfig.key === 'libelle' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-3 text-slate-400 min-w-[140px]">Référence</th>
                <th className="py-3.5 px-3 text-slate-400">Type Op.</th>
                <th className="py-3.5 px-4 text-slate-400 min-w-[180px]">Commentaire</th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('debit')}>
                  <div className="flex items-center justify-end gap-1">Débit {sortConfig.key === 'debit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-200/50 transition-colors" onClick={() => handleSort('credit')}>
                  <div className="flex items-center justify-end gap-1">Crédit {sortConfig.key === 'credit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-200/50 transition-colors min-w-[220px]" onClick={() => handleSort('compte')}>
                  <div className="flex items-center gap-1">Détail Compte {sortConfig.key === 'compte' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</div>
                </th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
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
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 whitespace-nowrap">{normaliserDateFR(t.date)}</td>
                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[10px]" title={t.id}>{t.id.substring(0, 6)}...</td>
                    <td className="py-3.5 px-3"><span className={`px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${sourceColor}`}>{sourceLabel}</span></td>
                    <td className="py-3.5 px-4 text-slate-800 font-semibold whitespace-normal max-w-xs leading-snug">{t.libelle}</td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-normal max-w-[140px]">{t.reference || <span className="text-slate-300 italic">-</span>}</td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs whitespace-nowrap">{t.typeOp || <span className="text-slate-300 italic">-</span>}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-normal max-w-[180px]">
                      {editingRowId === t.id ? (
                        <input type="text" defaultValue={t.commentaire || ''} onBlur={(e) => handleUpdateField(t.id, e.target.value, 'commentaire')} className="border border-indigo-300 rounded-lg p-1.5 text-xs bg-indigo-50/50 w-full outline-none" placeholder="Modifier commentaire..." autoFocus />
                      ) : ( t.commentaire || <span className="text-slate-300 italic">-</span> )}
                    </td>
                    {t.type === 'od' ? (
                      <>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700 whitespace-nowrap">{t.compteDebit ? formatMontant(t.montant) + ' €' : '-'}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700 whitespace-nowrap">{t.compteCredit ? formatMontant(t.montant) + ' €' : '-'}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-rose-600 whitespace-nowrap">{t.montant < 0 ? formatMontant(Math.abs(t.montant)) + ' €' : '-'}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 whitespace-nowrap">{t.montant > 0 ? formatMontant(t.montant) + ' €' : '-'}</td>
                      </>
                    )}
                    <td className="py-3.5 px-4 min-w-[220px]">
                      {editingRowId === t.id ? (
                        <SearchableCompteSelect value={t.compte || t.compteDebit || t.compteCredit || ''} comptesList={comptesList} onChange={(val) => { if (t.type === 'od') { handleUpdateField(t.id, val, t.compteDebit ? 'compteDebit' : 'compteCredit'); } else { handleUpdateField(t.id, val, 'compte'); } setEditingRowId(null); }} />
                      ) : (
                        t.type === 'od' ? (
                          (t.compteDebit && t.compteCredit) ? (
                            <div className="flex flex-col gap-0.5 min-w-[200px]">
                              <div className="text-xs text-slate-500 truncate"><span className="font-bold text-slate-700">D:</span> {t.compteDebit} {t.compteDebit && `- ${comptesList.find(c => c.code === t.compteDebit)?.libelle || ''}`}</div>
                              <div className="text-xs text-slate-500 truncate"><span className="font-bold text-slate-700">C:</span> {t.compteCredit} {t.compteCredit && `- ${comptesList.find(c => c.code === t.compteCredit)?.libelle || ''}`}</div>
                            </div>
                          ) : (
                            <div className="flex items-center w-fit min-w-[200px]"><span className="bg-purple-50/80 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-purple-800 border border-purple-200/80 max-w-[240px] truncate shadow-2xs">{t.compteDebit ? `${t.compteDebit} - ${comptesList.find(c => c.code === t.compteDebit)?.libelle || ''}` : `${t.compteCredit} - ${comptesList.find(c => c.code === t.compteCredit)?.libelle || ''}`}</span></div>
                          )
                        ) : (
                          <div className="flex items-center w-fit min-w-[200px]"><span className="bg-slate-100/80 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-700 border border-slate-200/80 max-w-[240px] truncate shadow-2xs">{t.compte ? `${t.compte} - ${comptesList.find(c => c.code === t.compte)?.libelle || ''}` : 'Non défini'}</span></div>
                        )
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center items-center gap-1.5">
                        {editingRowId === t.id ? (
                          <button onClick={() => setEditingRowId(null)} className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-xl text-xs font-bold transition-colors shadow-sm">OK</button>
                        ) : (
                          <>
                            <button onClick={() => setEditingRowId(t.id)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors" title="Modifier"><span className="font-bold text-base leading-none">✎</span></button>
                            {t.pdfData ? (
                              <div className="relative group/pdf inline-block">
                                <button onClick={() => { const win = window.open(); if (win) { win.document.write(`<iframe src="${t.pdfData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`); } }} className="text-indigo-600 hover:text-indigo-800 p-1.5 rounded-xl bg-indigo-50 border border-indigo-200 transition-all shadow-2xs" title={`Voir la facture/justificatif : ${t.pdfName || 'Pièce jointe'}`}>
                                  <Receipt size={16} className="text-indigo-600" />
                                </button>
                                <button onClick={async (e) => { e.stopPropagation(); if (window.confirm("Supprimer la pièce jointe ?")) { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', t.id), { pdfData: '', pdfName: '' }); } }} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-4 h-4 text-[10px] font-bold flex items-center justify-center opacity-0 group-hover/pdf:opacity-100 transition-opacity shadow-xs" title="Supprimer la pièce jointe">×</button>
                              </div>
                            ) : (
                              <button onClick={() => handleTriggerPdf(t.id)} className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors" title="Joindre un PDF ou justificatif"><Paperclip size={16} /></button>
                            )}
                            {confirmDeleteId === t.id ? (
                              <button onClick={() => handleDeleteValidated(t.id)} className="text-white bg-rose-600 hover:bg-rose-700 px-2 py-1 rounded-lg text-[10px] font-extrabold animate-pulse">Valider ?</button>
                            ) : (
                              <button onClick={() => handleDeleteValidated(t.id)} className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Supprimer"><Trash2 size={16}/></button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredAndSortedTransactions.length === 0 && (
                <tr>
                  <td colSpan="11" className="py-16 text-center bg-slate-50/40">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="p-4 bg-slate-100 text-slate-400 rounded-3xl"><BookOpen size={32} /></div>
                      <h4 className="font-bold text-slate-700 text-base">Aucune écriture au Grand Livre</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">Importe un relevé bancaire, un fichier de paie ou enregistre une opération diverse pour alimenter ta comptabilité.</p>
                    </div>
                  </td>
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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ code: '', libelle: '' });

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'comptes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liste = [];
      snapshot.forEach((doc) => {
        liste.push({ id: doc.id, ...doc.data() });
      });
      liste.sort((a, b) => a.code.localeCompare(b.code));
      setComptes(liste);
    });
    return () => unsubscribe();
  }, []);

  const handleAddCompte = async () => {
    if (!newCompte.code || !newCompte.libelle) return;
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

  const handleDeleteCompte = async (id, code) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le compte ${code} ?`)) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comptes', id));
      } catch(e) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const startEdit = (compte) => {
    setEditingId(compte.id);
    setEditForm({ code: compte.code, libelle: compte.libelle });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.code || !editForm.libelle) return alert("Les champs ne peuvent pas être vides.");
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

  const filteredComptes = comptes.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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

export default function App() {
  const [activeTab, setActiveTab] = useState('tableau_bord');
  const [transactionsGlobales, setTransactionsGlobales] = useState([]);

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
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
        <div className="p-6 flex flex-col items-center border-b border-slate-800">
          <div className="bg-white p-2 rounded-xl mb-3 shadow-lg">
            <img src={LOGO_URL} alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-white font-bold text-lg text-center leading-tight">Cours<br/>Tom Morel</h1>
          <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-semibold">ERP - Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
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

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Plannings Parents</h3>
            <button onClick={() => setActiveTab('menage_weekend')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'menage_weekend' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <AlertTriangle size={18} /> Ménage Week-end
            </button>
            <button onClick={() => setActiveTab('garde_cantine')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'garde_cantine' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <CheckCircle2 size={18} /> Garde Cantine / Cour
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Pilotage</h3>
            <button onClick={() => setActiveTab('tableau_bord')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'tableau_bord' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <LayoutDashboard size={18} /> Tableau de Bord
            </button>
            <button onClick={() => setActiveTab('etat_financier')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'etat_financier' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <PieChart size={18} /> État Financier
            </button>
          </div>

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

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider pl-3">Évènements</h3>
            <button onClick={() => setActiveTab('evenements_ecole')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'evenements_ecole' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <Calendar size={18} /> Liste des Évènements
            </button>
            <button onClick={() => setActiveTab('evenements_rentabilite')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'evenements_rentabilite' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
              <TrendingUp size={18} /> Rentabilité (Bilan)
            </button>
          </div>

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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
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

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
