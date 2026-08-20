import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, AlertTriangle, CheckCircle,
  Building, Calendar, CreditCard, PieChart, Shield, Lock, FileText, Upload, 
  Trash2, XCircle, Search, ChevronRight, CheckCircle2, AlertCircle, Paperclip,
  Plus, Sparkles, Receipt, Heart, FileSpreadsheet, Filter, Euro, Info, ChevronDown, Globe, Mail, Phone, Target, ArrowRightLeft
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, getDoc, updateDoc } from "firebase/firestore";

// Ignorer l'erreur de compilation locale si xlsx n'est pas installé dans le bac à sable
// Sur Vercel, cela fonctionnera car vous l'avez ajouté au package.json
let XLSX;
import(/* @vite-ignore */ 'xlsx').then(module => { XLSX = module; }).catch(() => {});

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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cours-tom-morel';

const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/AG8ngQXc96dCEFn_IAzMJapefM9CVcMYjacEj4SRG34_lJVisC1M2RC4JkeFV2b8VN30TwAnTJN-HEkeXqfMpIH6JEChx3G9H1CUQ1SZDm-NSmFVdlj6GrkzkC3KCDkK_StXgHclve-6ytuuMw4fYkWcKQqjzjQzYeMm3ScP0VIQbBepycX8NGq429QMYo05=w16383"; 

const EtatFinancier = ({ planComptable, transactionsGlobales }) => {
  const [anneeDebut, setAnneeDebut] = useState(2025); 
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const periode = useMemo(() => {
    return {
      debut: `${anneeDebut}-09-01`,
      fin: `${anneeDebut + 1}-08-31`,
      label: `Année Scolaire ${anneeDebut}-${anneeDebut + 1}`
    };
  }, [anneeDebut]);

  const transactionsFiltrees = useMemo(() => {
    return transactionsGlobales.filter(t => t.date >= periode.debut && t.date <= periode.fin);
  }, [periode, transactionsGlobales]);

  const totaux = useMemo(() => {
    let soldeBanque = 0;
    const parCompteBrut = {};

    // 1. Calcul des soldes bruts de chaque compte
    transactionsFiltrees.forEach(t => {
      if (t.type === 'od') {
          // Opération Diverse à double entrée (Ne touche pas le 512000 par défaut)
          if (t.compteDebit) {
              if (!parCompteBrut[t.compteDebit]) parCompteBrut[t.compteDebit] = 0;
              parCompteBrut[t.compteDebit] -= Math.abs(t.montant); // Le moins simule une charge/débit pour s'aligner avec la logique bancaire
          }
          if (t.compteCredit) {
              if (!parCompteBrut[t.compteCredit]) parCompteBrut[t.compteCredit] = 0;
              parCompteBrut[t.compteCredit] += Math.abs(t.montant); // Le plus simule un produit/crédit
          }
      } else {
          // Opération Bancaire classique (Contrepartie implicite = 512000)
          soldeBanque += (t.montant || 0);
          if (t.compte) {
              if (!parCompteBrut[t.compte]) parCompteBrut[t.compte] = 0;
              // Si montant < 0 (dépense banque), cela devient un solde positif pour la charge (- par -)
              parCompteBrut[t.compte] -= (t.montant || 0); 
          }
      }
    });

    // On force l'intégration du solde calculé de la banque dans la balance
    parCompteBrut['512000'] = (parCompteBrut['512000'] || 0) + soldeBanque;

    const charges = [];
    const produits = [];
    const actif = [];
    const passif = [];
    let totalCharges = 0;
    let totalProduits = 0;
    let totalActif = 0;
    let totalPassif = 0;

    // 2. Répartition dans les grandes masses (Bilan / Résultat)
    Object.entries(parCompteBrut).forEach(([compte, solde]) => {
      if (Math.abs(solde) < 0.01) return;

      const compteInfo = planComptable.find(c => c.id === compte);
      const label = compteInfo ? compteInfo.label : (compte === '512000' ? 'Banque Caisse d\'épargne' : 'Compte Inconnu');
      const firstDigit = compte.charAt(0);
      
      if (['6'].includes(firstDigit)) {
         charges.push({ compte, label, montant: Math.abs(solde) });
         totalCharges += Math.abs(solde);
      } else if (['7'].includes(firstDigit)) {
         produits.push({ compte, label, montant: Math.abs(solde) });
         totalProduits += Math.abs(solde);
      } else if (['1', '2', '3', '4', '5'].includes(firstDigit)) {
         // Actif: Comptes 2, 3, 4 débiteurs, 5 débiteurs
         // Passif: Comptes 1, 4 créditeurs, 5 créditeurs (découvert)
         // Dans notre logique de 'soldeBanque' ci-dessus, un solde positif est un Actif.
         if (solde > 0) {
             actif.push({ compte, label, montant: solde });
             totalActif += solde;
         } else if (solde < 0) {
             passif.push({ compte, label, montant: Math.abs(solde) });
             totalPassif += Math.abs(solde);
         }
      }
    });

    const resultat = totalProduits - totalCharges;

    // 3. Fonction de groupement par Sous-Catégories comptables
    const grouperComptes = (comptesArray, estBilan) => {
        const groupes = {};
        comptesArray.forEach(item => {
            let categorieId = '';
            let categorieLabel = '';
            const num = parseInt(item.compte.substring(0, 2), 10);
            
            if (estBilan) {
                if (num >= 20 && num <= 29) { categorieId = 'A1'; categorieLabel = 'Actif Immobilisé'; }
                else if (num >= 30 && num <= 59) { categorieId = 'A2'; categorieLabel = 'Actif Circulant'; }
                else if (num >= 10 && num <= 15) { categorieId = 'P1'; categorieLabel = 'Fonds Propres'; }
                else { categorieId = 'P2'; categorieLabel = 'Dettes'; }
            } else {
                if (num >= 60 && num <= 65) { categorieId = 'C1'; categorieLabel = 'Charges d\'exploitation'; }
                else if (num === 66) { categorieId = 'C2'; categorieLabel = 'Charges financières'; }
                else if (num >= 67 && num <= 68) { categorieId = 'C3'; categorieLabel = 'Charges exceptionnelles et Dotations'; }
                else if (num >= 70 && num <= 75) { categorieId = 'R1'; categorieLabel = 'Produits d\'exploitation'; }
                else if (num === 76) { categorieId = 'R2'; categorieLabel = 'Produits financiers'; }
                else { categorieId = 'R3'; categorieLabel = 'Produits exceptionnels et Reprises'; }
            }

            if (!groupes[categorieId]) {
                groupes[categorieId] = {
                    id: categorieId,
                    label: categorieLabel,
                    montantTotal: 0,
                    details: []
                };
            }
            groupes[categorieId].details.push(item);
            groupes[categorieId].montantTotal += item.montant;
        });

        return Object.values(groupes)
            .sort((a, b) => a.id.localeCompare(b.id))
            .map(groupe => ({
                ...groupe,
                details: groupe.details.sort((a, b) => a.compte.localeCompare(b.compte))
            }));
    };

    const chargesGroupees = grouperComptes(charges, false);
    const produitsGroupes = grouperComptes(produits, false);
    const actifGroupe = grouperComptes(actif, true);
    const passifGroupe = grouperComptes(passif, true);

    // 4. Intégration du Résultat dans le Passif (Fonds Propres) pour équilibrer le Bilan
    let familleResultat = passifGroupe.find(g => g.id === 'P1');
    if (!familleResultat) {
        familleResultat = { id: 'P1', label: 'Fonds Propres', montantTotal: 0, details: [] };
        passifGroupe.push(familleResultat);
        passifGroupe.sort((a, b) => a.id.localeCompare(b.id));
    }
    
    familleResultat.details.push({ 
        compte: '120000', 
        label: resultat >= 0 ? 'Résultat de l\'exercice (Bénéfice)' : 'Résultat de l\'exercice (Perte)', 
        montant: Math.abs(resultat),
        isResultat: true,
        valeurNette: resultat < 0 ? -Math.abs(resultat) : Math.abs(resultat)
    });
    
    if (resultat > 0) {
        familleResultat.montantTotal += resultat;
    } else {
        familleResultat.montantTotal -= Math.abs(resultat);
    }
    
    const grandTotalPassif = totalPassif + resultat;

    return { 
        chargesGroupees, produitsGroupes, totalCharges, totalProduits, resultat, 
        actifGroupe, passifGroupe, totalActif, grandTotalPassif
    };
  }, [transactionsFiltrees, planComptable]);

  const toggleGroup = (groupId) => setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  const expandAll = () => {
      const newExpanded = {};
      [...totaux.chargesGroupees, ...totaux.produitsGroupes, ...totaux.actifGroupe, ...totaux.passifGroupe].forEach(g => newExpanded[g.id] = true);
      setExpandedGroups(newExpanded);
  };
  const collapseAll = () => setExpandedGroups({});

  const RenderTable = ({ groupes, type }) => {
      return (
          <div className="divide-y divide-slate-100">
              {groupes.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">Aucune donnée sur cette période.</div>
              ) : (
                  groupes.map(groupe => {
                      const isExpanded = expandedGroups[groupe.id];
                      return (
                          <div key={groupe.id} className="group">
                              {/* En-tête de Sous-catégorie */}
                              <div onClick={() => toggleGroup(groupe.id)} className={`flex justify-between items-center p-3 cursor-pointer transition-colors ${type === 'charge' ? 'bg-rose-50/50 hover:bg-rose-100/50' : type === 'produit' ? 'bg-emerald-50/50 hover:bg-emerald-100/50' : type === 'actif' ? 'bg-blue-50/50 hover:bg-blue-100/50' : 'bg-amber-50/50 hover:bg-amber-100/50'}`}>
                                  <div className="flex items-center gap-2">
                                      {isExpanded ? <ChevronDown size={16} className="text-slate-400"/> : <ChevronRight size={16} className="text-slate-400"/>}
                                      <span className={`font-bold text-sm ${type === 'charge' ? 'text-rose-900' : type === 'produit' ? 'text-emerald-900' : type === 'actif' ? 'text-blue-900' : 'text-amber-900'}`}>{groupe.label}</span>
                                  </div>
                                  <span className={`font-bold text-sm ${type === 'charge' ? 'text-rose-900' : type === 'produit' ? 'text-emerald-900' : type === 'actif' ? 'text-blue-900' : 'text-amber-900'}`}>{groupe.montantTotal.toFixed(2)} €</span>
                              </div>
                              {/* Lignes détaillées de la sous-catégorie */}
                              {isExpanded && (
                                  <div className="bg-white border-t border-slate-100">
                                      <table className="w-full text-sm text-left">
                                          <tbody>
                                              {groupe.details.map(detail => (
                                                  <tr key={detail.compte} className="hover:bg-slate-50 border-b border-slate-50 last:border-0">
                                                      <td className="p-2 pl-8 font-mono text-xs text-slate-500 w-24">{detail.compte}</td>
                                                      <td className={`p-2 ${detail.isResultat ? 'font-bold italic text-slate-800' : 'text-slate-600'}`}>{detail.label}</td>
                                                      <td className={`p-2 text-right ${detail.isResultat && detail.valeurNette < 0 ? 'text-rose-600 font-bold' : detail.isResultat ? 'text-emerald-600 font-bold' : 'text-slate-700'}`}>
                                                          {detail.isResultat && detail.valeurNette < 0 ? '-' : ''}
                                                          {detail.montant.toFixed(2)} €
                                                      </td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </div>
                              )}
                          </div>
                      );
                  })
              )}
          </div>
      );
  };

  return (
    <div className="space-y-12 animate-in fade-in pb-12">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-blue-600" /> États Financiers
          </h2>
          <p className="text-slate-500 mt-1">Bilan et Compte de Résultat détaillés de l'association.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 hidden md:flex">
              <button onClick={expandAll} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded transition-colors font-medium">Tout Déplier</button>
              <button onClick={collapseAll} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded transition-colors font-medium">Tout Replier</button>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={anneeDebut} onChange={(e) => setAnneeDebut(Number(e.target.value))}
              className="p-1.5 border-none bg-transparent text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
            >
              <option value={2021}>01/09/21 au 31/08/22</option>
              <option value={2022}>01/09/22 au 31/08/23</option>
              <option value={2023}>01/09/23 au 31/08/24</option>
              <option value={2024}>01/09/24 au 31/08/25</option>
              <option value={2025}>01/09/25 au 31/08/26</option>
              <option value={2026}>01/09/26 au 31/08/27</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- SECTION COMPTE DE RÉSULTAT --- */}
      <div className="space-y-4">
        <div className="flex items-start gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg shrink-0"><Info size={24} /></div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Compte de Résultat</h3>
                <p className="text-sm text-slate-600 mt-1">Le Compte de Résultat analyse la gestion de l'année. Il liste toutes les <b>Charges</b> (dépenses) et les <b>Produits</b> (recettes) pour déterminer si l'association a généré un bénéfice ou une perte sur la période.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-full text-emerald-600"><Plus size={24}/></div>
                <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Produits (Cl. 7)</p><p className="text-2xl font-bold text-slate-800">{totaux.totalProduits.toFixed(2)} €</p></div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-rose-500 flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-full text-rose-600"><Trash2 size={24}/></div>
                <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Charges (Cl. 6)</p><p className="text-2xl font-bold text-slate-800">{totaux.totalCharges.toFixed(2)} €</p></div>
            </div>
            <div className={`bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 ${totaux.resultat >= 0 ? 'border-l-blue-500' : 'border-l-orange-500'} flex items-center gap-4`}>
                <div className={`p-3 rounded-full ${totaux.resultat >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}><Building size={24}/></div>
                <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Résultat (Bénéfice/Perte)</p><p className={`text-2xl font-bold ${totaux.resultat >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>{totaux.resultat >= 0 ? '+' : ''}{totaux.resultat.toFixed(2)} €</p></div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden flex flex-col">
                <div className="bg-rose-50 text-rose-800 p-4 border-b border-slate-300 font-bold text-lg text-center uppercase tracking-wide">Charges (Dépenses)</div>
                <div className="p-0 flex-1"><RenderTable groupes={totaux.chargesGroupees} type="charge" /></div>
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center font-bold text-lg mt-auto">
                    <span>TOTAL CHARGES</span>
                    <span>{totaux.resultat > 0 ? (totaux.totalCharges + totaux.resultat).toFixed(2) : totaux.totalCharges.toFixed(2)} €</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden flex flex-col">
                <div className="bg-emerald-50 text-emerald-800 p-4 border-b border-slate-300 font-bold text-lg text-center uppercase tracking-wide">Produits (Recettes)</div>
                <div className="p-0 flex-1"><RenderTable groupes={totaux.produitsGroupes} type="produit" /></div>
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center font-bold text-lg mt-auto">
                    <span>TOTAL PRODUITS</span>
                    <span>{totaux.resultat < 0 ? (totaux.totalProduits + Math.abs(totaux.resultat)).toFixed(2) : totaux.totalProduits.toFixed(2)} €</span>
                </div>
            </div>
        </div>
      </div>

      <div className="h-px bg-slate-200 my-10"></div>

      {/* --- SECTION BILAN --- */}
      <div className="space-y-4">
        <div className="flex items-start gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-lg shrink-0"><Building size={24} /></div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Bilan au 31/08/{anneeDebut + 1}</h3>
                <p className="text-sm text-slate-600 mt-1">Le Bilan est la "photographie" du patrimoine. L'<b>Actif</b> représente ce que l'association possède (trésorerie en banque, créances) et le <b>Passif</b> ce qu'elle doit (capitaux propres, résultat à affecter, dettes).</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden flex flex-col">
                <div className="bg-blue-50 text-blue-800 p-4 border-b border-slate-300 font-bold text-lg text-center uppercase tracking-wide">Actif (Possessions)</div>
                <div className="p-0 flex-1"><RenderTable groupes={totaux.actifGroupe} type="actif" /></div>
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center font-bold text-lg mt-auto">
                    <span>TOTAL ACTIF</span>
                    <span>{totaux.totalActif.toFixed(2)} €</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-300 overflow-hidden flex flex-col">
                <div className="bg-amber-50 text-amber-800 p-4 border-b border-slate-300 font-bold text-lg text-center uppercase tracking-wide">Passif (Capitaux & Dettes)</div>
                <div className="p-0 flex-1"><RenderTable groupes={totaux.passifGroupe} type="passif" /></div>
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center font-bold text-lg mt-auto">
                    <span>TOTAL PASSIF</span>
                    <span>{totaux.grandTotalPassif.toFixed(2)} €</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const GrandLivre = ({ planComptable, transactions, setTransactions, firebaseUser, globalTransactions }) => {
  const [lastImportIds, setLastImportIds] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputCsvRef = useRef(null);
  const fileInputXlsxRef = useRef(null);
  const [odForm, setOdForm] = useState({ date: '', libelle: '', debit: '', credit: '', montant: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const autoImpute = (libelle, typeOp) => {
    const text = (libelle + " " + typeOp).toLowerCase();
    if (text.includes('frais') || text.includes('extournes') || text.includes('cotisation') || 
        text.includes('forfait') || text.includes('bl association') || text.includes('commission') || text.includes('agios')) return '627000';
    if (text.includes('bureau') || text.includes('fournitures') || text.includes('papeterie') || text.includes('amazon')) return '606400';
    if (text.includes('livre') || text.includes('manuel') || text.includes('scolaire') || text.includes('pedagogique')) return '606800';
    if (text.includes('loyer') || text.includes('sci ') || text.includes('location')) return '613200';
    if (text.includes('edf') || text.includes('engie') || text.includes('eau ') || text.includes('electricite')) return '606100';
    if (text.includes('assurance') || text.includes('mutuelle') || text.includes('axa ') || text.includes('macif')) return '616000';
    if (text.includes('menage') || text.includes('nettoyage') || text.includes('entretien')) return '615000';
    if (text.includes('salaire') || text.includes('virement ') && (text.includes('prof') || text.includes('enseignant'))) return '641000';
    if (text.includes('urssaf') || text.includes('retraite') || text.includes('pole emploi')) return '645000';
    if (text.includes('helloasso') || text.includes('stripe')) return '471000';
    if (text.includes('scolarite') || text.includes('cantine') || text.includes('inscription')) return '706000';
    if (text.includes('don ') || text.includes('mecenat') || text.includes('soutien')) return '754000';
    return 'ATTENTE';
  };

  const handleImportFile = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const extension = file.name.split('.').pop().toLowerCase();

      try {
          let rows = [];
          if (extension === 'csv') {
              const text = await file.text();
              const lines = text.split(/\r?\n/);
              rows = lines.map(line => line.split(';'));
          } else if (extension === 'xlsx') {
              if (typeof XLSX === 'undefined') {
                  showToast("Le module XLSX n'est pas encore prêt. Essayez le CSV pour le moment.", "error");
                  return;
              }
              const data = await file.arrayBuffer();
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              // On utilise raw: false pour lire les dates formatées comme du texte
              rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
          }

          const newTransactions = [];
          const newIds = [];
          
          // La ligne 0 est l'en-tête, on commence à 1
          for (let i = 1; i < rows.length; i++) {
              const cols = rows[i];
              if (!cols || cols.length < 7) continue;
              
              let dateStr = cols[0] ? String(cols[0]).trim() : '';
              let libelleSimplifie = cols[1] ? String(cols[1]).trim() : '';
              let reference = cols[2] ? String(cols[2]).trim() : '';
              let infoCompl = cols[3] ? String(cols[3]).trim() : '';
              let typeOpBancaire = cols[4] ? String(cols[4]).trim() : '';
              
              let debitStr = cols[5] !== undefined && cols[5] !== '' ? String(cols[5]).replace(',', '.').replace(/[^-0-9.]/g, '') : '';
              let creditStr = cols[6] !== undefined && cols[6] !== '' ? String(cols[6]).replace(',', '.').replace(/[^-0-9.]/g, '') : '';
              
              let dateOperation = cols[7] ? String(cols[7]).trim() : '';
              let dateValeur = cols[8] ? String(cols[8]).trim() : '';
              let lettrage = cols[9] ? String(cols[9]).trim() : '';

              const libelleComplet = `${libelleSimplifie} ${infoCompl ? '('+infoCompl+')' : ''}`.trim();
              
              let montant = 0;
              if (debitStr && debitStr !== '') montant = parseFloat(debitStr);
              else if (creditStr && creditStr !== '') montant = parseFloat(creditStr);

              // Ne pas importer les lignes vides ou titres
              if (isNaN(montant) || Math.abs(montant) < 0.01) continue;

              const newId = Date.now() + i + Math.floor(Math.random() * 1000);
              newIds.push(newId);

              newTransactions.push({
                id: newId, 
                date: dateStr,
                date_operation: dateOperation,
                date_valeur: dateValeur,
                libelle_simplifie: libelleSimplifie,
                reference: reference,
                info_complementaire: infoCompl,
                type_operation_bancaire: typeOpBancaire,
                lettrage: lettrage,
                type: typeOpBancaire, 
                libelle: libelleComplet,
                montant: montant, 
                compte: autoImpute(libelleComplet, typeOpBancaire),
                status: 'pending'
              });
          }
          setTransactions([...newTransactions, ...transactions]);
          setLastImportIds(newIds);
          showToast(`${newTransactions.length} opérations importées. À vous de les valider !`);
          
      } catch (err) {
          console.error(err);
          showToast(`Erreur de lecture du fichier ${extension.toUpperCase()}.`, "error");
      }
      e.target.value = null; // Reset input
  };

  const handleValidate = async (t) => {
    if (!firebaseUser) return showToast("Vous devez être connecté.", "error");
    if (t.compte === 'ATTENTE') return showToast("Veuillez sélectionner un compte.", "error");

    let formattedDate = t.date;
    if (t.date.includes('/')) {
      const parts = t.date.split('/');
      if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    const newGlobalTx = {
      date: formattedDate,
      date_operation: t.date_operation || '',
      date_valeur: t.date_valeur || '',
      libelle_simplifie: t.libelle_simplifie || '',
      reference: t.reference || '',
      info_complementaire: t.info_complementaire || '',
      type_operation_bancaire: t.type_operation_bancaire || '',
      lettrage: t.lettrage || '',
      libelle: t.libelle,
      montant: t.montant,
      type: t.montant > 0 ? 'recette' : 'depense',
      compte: t.compte,
      date_creation: new Date().toISOString()
    };
    
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newGlobalTx);
        setTransactions(transactions.filter(tr => tr.id !== t.id));
        showToast("Écriture enregistrée !");
    } catch (e) { showToast("Erreur.", "error"); }
  };

  const handleAddOD = async (e) => {
    e.preventDefault();
    if (!firebaseUser || !odForm.date || !odForm.libelle || !odForm.montant || !odForm.debit || !odForm.credit) return;
    
    const montantNum = parseFloat(odForm.montant);
    const newGlobalTx = {
      date: odForm.date, 
      libelle: `(OD) ${odForm.libelle}`, 
      montant: montantNum,
      type: 'od', 
      compteDebit: odForm.debit, 
      compteCredit: odForm.credit, 
      date_creation: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newGlobalTx);
        showToast("OD enregistrée au Grand Livre !");
        setOdForm({ date: '', libelle: '', debit: '', credit: '', montant: '' });
    } catch(err) { showToast("Erreur d'enregistrement.", "error"); }
  };

  const handleUpdateCompte = async (txId, newCompte) => {
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId), { compte: newCompte });
          showToast("Compte modifié.");
      } catch (e) { showToast("Erreur lors de la modification.", "error"); }
  };

  const handleDeleteValidated = async (txId) => {
      if (confirmDeleteId === txId) {
          try {
              await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId));
              showToast("Écriture supprimée.");
              setConfirmDeleteId(null);
          } catch(e) { showToast("Erreur.", "error"); }
      } else {
          setConfirmDeleteId(txId);
          setTimeout(() => setConfirmDeleteId(null), 3000); 
      }
  };

  const handlePdfUploadStub = () => showToast("Envoi de PDF bientôt activé avec Firebase Storage.", "success");

  const validatedTransactions = [...(globalTransactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8 animate-in fade-in relative">
      {toast && (
        <div className={`absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} {toast.message}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-1">
          <BookOpen className="text-blue-600" /> Grand Livre (Import & Saisie)
        </h2>
        <p className="text-slate-500">Importez vos relevés bancaires ou saisissez une OD manuelle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                <CreditCard size={20} className="text-blue-500"/> Journal de Banque
                </h3>
            </div>
            <div className="space-y-3">
                {lastImportIds.length > 0 && (
                <button onClick={() => { setTransactions(transactions.filter(t => !lastImportIds.includes(t.id))); setLastImportIds([]); }} className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                    Annuler le dernier import en cours
                </button>
                )}
                <div className="flex flex-col gap-3">
                    <input type="file" accept=".csv" className="hidden" ref={fileInputCsvRef} onChange={handleImportFile} />
                    <button onClick={() => fileInputCsvRef.current.click()} className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
                        <Upload size={18} /> Importer un relevé (.csv)
                    </button>
                    
                    <input type="file" accept=".xlsx" className="hidden" ref={fileInputXlsxRef} onChange={handleImportFile} />
                    <button onClick={() => fileInputXlsxRef.current.click()} className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-700 transition-colors">
                        <FileSpreadsheet size={18} /> Importer un relevé (.xlsx)
                    </button>
                </div>
            </div>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-800 flex items-center gap-2 mb-4">
            <FileSignature size={20} /> Saisir une Opération Diverse (OD)
            </h3>
            <form onSubmit={handleAddOD} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Date</label>
                        <input type="date" required value={odForm.date} onChange={e=>setOdForm({...odForm, date: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm outline-none bg-white" />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Montant (€)</label>
                        <input type="number" step="0.01" required value={odForm.montant} onChange={e=>setOdForm({...odForm, montant: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm outline-none bg-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Libellé</label>
                    <input type="text" placeholder="Ex: Ajustement de caisse, provisions..." required value={odForm.libelle} onChange={e=>setOdForm({...odForm, libelle: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm outline-none bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Compte Débit</label>
                        <select required value={odForm.debit} onChange={e=>setOdForm({...odForm, debit: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm outline-none bg-white">
                        <option value="">Sélectionner...</option>
                        {planComptable.map(c => <option key={`d-${c.id}`} value={c.id}>{c.id}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Compte Crédit</label>
                        <select required value={odForm.credit} onChange={e=>setOdForm({...odForm, credit: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm outline-none bg-white">
                        <option value="">Sélectionner...</option>
                        {planComptable.map(c => <option key={`c-${c.id}`} value={c.id}>{c.id}</option>)}
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors mt-2 flex items-center justify-center gap-2">
                   <ArrowRightLeft size={16} /> Ajouter l'OD
                </button>
            </form>
          </div>
      </div>

      {}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-amber-50 p-3 border-b border-amber-100 flex items-center gap-2 text-amber-800 font-bold"><AlertTriangle size={18} /> Lignes en attente de validation ({transactions.length})</div>
          <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Libellé</th><th className="py-3 px-4 text-right">Montant</th><th className="py-3 px-4">Compte</th><th className="py-3 px-4 text-center">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">{t.date}</td>
                    <td className="py-3 px-4 truncate max-w-[250px]" title={t.libelle}>{t.libelle}</td>
                    <td className={`py-3 px-4 text-right font-bold ${t.montant > 0 ? 'text-emerald-600' : ''}`}>{t.montant} €</td>
                    <td className="py-3 px-4">
                      <select value={t.compte} onChange={(e) => setTransactions(transactions.map(tr => tr.id === t.id ? {...tr, compte: e.target.value} : tr))} className={`p-2 border rounded-md max-w-[200px] bg-white w-full ${t.compte === 'ATTENTE' ? 'border-amber-300 text-amber-700 font-bold' : 'border-slate-200'}`}>
                        <option value="ATTENTE">⚠️ À classer...</option>
                        {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleValidate(t)} className="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded"><CheckCircle size={20}/></button>
                        <button onClick={() => setTransactions(transactions.filter(tr => tr.id !== t.id))} className="text-red-400 hover:bg-red-50 p-1.5 rounded"><Trash2 size={20}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      )}

      {}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
               <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Écritures Validées au Grand Livre</h3>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">{validatedTransactions.length} écritures</span>
         </div>
         <div className="max-h-[600px] overflow-y-auto">
            {validatedTransactions.length === 0 ? (
               <div className="p-12 text-center text-slate-400 text-sm">Aucune écriture enregistrée.</div>
            ) : (
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white sticky top-0 shadow-sm text-slate-500 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
                     <tr>
                        <th className="py-3 px-4">Date</th><th className="py-3 px-4">Libellé</th><th className="py-3 px-4 text-right">Mouvement</th><th className="py-3 px-4">Compte Imputé</th><th className="py-3 px-4 text-center">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {validatedTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                           <td className="py-3 px-4 text-slate-500">{t.date}</td>
                           <td className="py-3 px-4 truncate max-w-[300px] font-medium" title={t.libelle}>{t.libelle}</td>
                           
                           {t.type === 'od' ? (
                               <>
                                 <td className="py-3 px-4 text-right font-bold text-indigo-600 text-xs uppercase tracking-wider">OD : {t.montant.toFixed(2)} €</td>
                                 <td className="py-3 px-4 text-xs text-slate-500">
                                     <div className="flex gap-2"><span className="font-bold text-slate-700 w-4">D:</span> <span className="font-mono text-indigo-600">{t.compteDebit}</span></div>
                                     <div className="flex gap-2 mt-1"><span className="font-bold text-slate-700 w-4">C:</span> <span className="font-mono text-pink-600">{t.compteCredit}</span></div>
                                 </td>
                               </>
                           ) : (
                               <>
                                 <td className={`py-3 px-4 text-right font-bold ${t.montant > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                    {t.montant > 0 ? '+' : ''}{t.montant.toFixed(2)} €
                                 </td>
                                 <td className="py-3 px-4">
                                    <select value={t.compte} onChange={(e) => handleUpdateCompte(t.id, e.target.value)} className="p-1.5 border border-transparent hover:border-slate-300 rounded max-w-[200px] bg-transparent hover:bg-white text-xs font-mono">
                                        {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                                    </select>
                                 </td>
                               </>
                           )}
                           
                           <td className="py-3 px-4 text-center flex items-center justify-center gap-1">
                              <button onClick={handlePdfUploadStub} className="text-slate-400 hover:text-blue-600 p-1.5 rounded" title="Joindre un justificatif"><Paperclip size={16} /></button>
                              {confirmDeleteId === t.id ? (
                                  <button onClick={() => handleDeleteValidated(t.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">Confirmer ?</button>
                              ) : (
                                  <button onClick={() => handleDeleteValidated(t.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded"><Trash2 size={16} /></button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            )}
         </div>
      </div>
    </div>
  );
};

const PlanComptableManager = ({ planComptable, firebaseUser }) => {
  const [newId, setNewId] = useState(''); const [newLabel, setNewLabel] = useState('');
  const fileInputRef = useRef(null); const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const handleAdd = async (e) => {
    e.preventDefault(); if (!firebaseUser || !newId || !newLabel) return;
    try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', newId), { label: newLabel }); setNewId(''); setNewLabel(''); showToast("Compte enregistré !");
    } catch(err) { showToast("Erreur.", "error"); }
  };
  const removeCompte = async (id) => {
    if (!firebaseUser) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', id)); showToast("Compte supprimé."); } catch(err) { showToast("Erreur.", "error"); }
  };
  const handleImportCSV = (e) => {
    if (!firebaseUser) return; const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result; const lines = text.split(/\r?\n/); let count = 0;
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(/[;,]/);
          if (cols.length >= 2) {
            const numeroStr = cols[0].trim().replace(/['"]/g, ''); const libelleStr = cols[1].trim().replace(/['"]/g, '');
            if (numeroStr.match(/^[0-9]+$/) && numeroStr.length >= 2) { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', numeroStr), { label: libelleStr }); count++; }
          }
        }
        showToast(`${count} comptes importés !`);
      } catch (err) { showToast("Erreur CSV.", "error"); }
    };
    reader.readAsText(file, 'ISO-8859-1'); e.target.value = null; 
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto relative">
      {toast && <div className="absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 bg-green-100 text-green-700"><CheckCircle2 size={18} /> {toast.message}</div>}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><BookOpen className="text-purple-600"/> Plan Comptable</h2>
        <div>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"><Upload size={18}/> Importer un Plan (.csv)</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]"><label className="block text-xs font-medium text-slate-500 mb-1">N°</label><input type="text" required placeholder="Ex: 606100" value={newId} onChange={e=>setNewId(e.target.value)} className="w-full p-2 border rounded-md text-sm" /></div>
          <div className="flex-[2] min-w-[200px]"><label className="block text-xs font-medium text-slate-500 mb-1">Libellé</label><input type="text" required placeholder="Ex: Eau et électricité" value={newLabel} onChange={e=>setNewLabel(e.target.value)} className="w-full p-2 border rounded-md text-sm" /></div>
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm h-[38px]"><Plus size={16}/></button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {planComptable.map(compte => (
              <div key={compte.id} className="p-4 flex justify-between items-center hover:bg-slate-50 group">
                <div className="flex items-center gap-4"><span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-sm">{compte.id}</span><span className="font-medium text-slate-700">{compte.label}</span></div>
                <button onClick={() => removeCompte(compte.id)} className="text-slate-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GestionAcces = ({ firebaseUser }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), snap => setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() }))));
    return () => unsub();
  }, [firebaseUser]);
  
  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl relative">
      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-full"><Lock size={24} className="text-blue-300"/></div>
        <div><h2 className="text-2xl font-bold">Gestion des Accès</h2><p className="text-slate-300 mt-1 text-sm">Définissez la vue pour chaque identifiant.</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr><th className="py-3 px-4">Identifiant</th><th className="py-3 px-4">Droits actuels</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-700">{u.identifiant}</td>
                <td className="py-3 px-4"><select value={u.role} onChange={(e) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid), {role: e.target.value})} className="p-2 border rounded-md"><option value="famille">Vue Famille</option><option value="admin">Vue Admin</option></select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [identifiant, setIdentifiant] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault(); setError('');
    const cleanId = identifiant.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    const pseudoEmail = `${cleanId}@erp.tommorel`;
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, pseudoEmail, password);
        onLogin(userCredential.user, cleanId, true);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, pseudoEmail, password);
        onLogin(userCredential.user, cleanId, false);
      }
    } catch (err) { setError("Erreur de connexion."); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8"><img src={LOGO_URL} alt="Logo" className="h-24 mx-auto mb-4 object-contain" /><h1 className="text-2xl font-bold text-slate-800">Portail Sécurisé</h1></div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><XCircle size={18}/>{error}</div>}
        <form onSubmit={handleAuth} className="space-y-5">
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Identifiant</label><input type="text" value={identifiant} onChange={e=>setIdentifiant(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" /></div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">{isRegistering ? "Créer mon compte" : "Se connecter"}</button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-blue-600 hover:underline">{isRegistering ? "Déjà un compte ?" : "Pas de compte ?"}</button></div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('infos');
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [globalTransactions, setGlobalTransactions] = useState([]);
  const [planComptable, setPlanComptable] = useState([]);
  const [journalTransactions, setJournalTransactions] = useState([]);

  const loadUserProfile = async (user, identifiantFromLogin = null, isNewRegistration = false) => {
    try {
      const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
      const userSnap = await getDoc(userRef);
      let role = 'famille'; let identifiant = identifiantFromLogin || user.email.split('@')[0];
      if (userSnap.exists()) { role = userSnap.data().role; identifiant = userSnap.data().identifiant || identifiant; } 
      else if (isNewRegistration || identifiant === 'admin') { role = identifiant === 'admin' ? 'admin' : 'famille'; await setDoc(userRef, { identifiant, role, createdAt: new Date().toISOString() }); }
      setCurrentUser({ identifiant, role, uid: user.uid });
      setActiveTab(role === 'admin' ? 'dashboard' : 'infos');
    } catch (e) {}
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => { setFirebaseUser(user); if (user && !currentUser) loadUserProfile(user); else if (!user) setCurrentUser(null); });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubPc = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'plan_comptable'), snap => setPlanComptable(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.id.localeCompare(b.id))));
    const unsubTx = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), snap => setGlobalTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { unsubPc(); unsubTx(); };
  }, [firebaseUser]);

  if (!currentUser) return <LoginScreen onLogin={loadUserProfile} />;
  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 overflow-y-auto">
        <div className="p-6 bg-slate-950/50 flex flex-col items-center border-b border-slate-800 shrink-0">
          <img src={LOGO_URL} alt="Logo" className="h-16 w-16 mb-3 object-contain rounded-xl bg-white p-1" />
          <h1 className="text-lg font-bold text-white tracking-wide text-center leading-tight">Cours<br/>Tom Morel</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-2">ERP - {isAdmin ? 'Admin' : 'Famille'}</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          <div>
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Espace Famille</h3>
             <ul className="space-y-1">
                <li><button onClick={() => setActiveTab('infos')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'infos' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><Info size={18} /> Infos & Contact</button></li>
                <li><button onClick={() => setActiveTab('dossiers')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'dossiers' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><GraduationCap size={18} /> Scolarité</button></li>
                <li><button onClick={() => setActiveTab('mes_factures')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'mes_factures' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><Receipt size={18} /> Mes Factures</button></li>
             </ul>
          </div>
          {isAdmin && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Gestion & Logistique</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('manage')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'manage' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><Users size={18} /> Gestion Scolaire</button></li>
                  <li><button onClick={() => setActiveTab('stock')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'stock' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'}`}><Building size={18} /> Gestion des Stocks</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Pilotage</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Tableau de Bord</button></li>
                  <li><button onClick={() => setActiveTab('etat_financier')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'etat_financier' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}><PieChart size={18} /> État Financier</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Compta & Finances</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('grand_livre')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'grand_livre' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><BookOpen size={18} /> Grand Livre</button></li>
                  <li><button onClick={() => setActiveTab('plan_comptable')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'plan_comptable' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><FileSignature size={18} /> Plan Comptable</button></li>
                  <li><button onClick={() => setActiveTab('budget')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'budget' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><Target size={18} /> Budget</button></li>
                  <li><button onClick={() => setActiveTab('notes_frais')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'notes_frais' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}><FileText size={18} /> Notes de Frais</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Administration</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('acces')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${activeTab === 'acces' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800'}`}><Lock size={18} /> Gestion Accès</button></li>
                </ul>
              </div>
            </>
          )}
        </nav>
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0"><button onClick={() => signOut(auth)} className="w-full py-2 bg-slate-800 hover:text-red-400 rounded flex justify-center items-center gap-2"><XCircle size={16}/> Déconnexion</button></div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50">
        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'infos' && (
             <div className="space-y-6 animate-in fade-in">
                <div className="bg-blue-600 rounded-xl p-8 text-white shadow-md">
                   <h2 className="text-3xl font-bold mb-2">Bienvenue sur le portail du Cours Tom Morel</h2>
                   <p className="text-blue-100 text-lg">Retrouvez ici toutes les informations de scolarité et les plannings.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm text-center flex flex-col">
                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto"><Globe size={24} /></div>
                    <h3 className="font-bold text-slate-800">Le Cours Tom Morel</h3>
                    <p className="text-xs font-semibold text-blue-600 mb-3">24 rue de la Chapelle, Saint-Chef</p>
                    <a href="https://www.courstommorel.fr" target="_blank" rel="noopener noreferrer" className="w-full mt-auto py-2 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center justify-center gap-2"><Globe size={16} /> Visiter le site</a>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm text-center flex flex-col">
                    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 mx-auto"><Mail size={24} /></div>
                    <h3 className="font-bold text-slate-800">Direction de l'École</h3>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Mme Laurence Gérard</p>
                    <p className="text-[10px] text-slate-400 mb-3 leading-tight">Équipe enseignante: Mme Meyer,<br/>Mme Dupont, M. Martin</p>
                    <div className="mt-auto space-y-2">
                      <a href="tel:0667909576" className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-50"><Phone size={16} /> 06 67 90 95 76</a>
                      <a href="mailto:direction@courstommorel.fr" className="w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-emerald-100"><Mail size={16} /> Écrire</a>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm text-center flex flex-col">
                    <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto"><Building size={24} /></div>
                    <h3 className="font-bold text-slate-800">Association (Bureau)</h3>
                    <p className="text-xs font-semibold text-purple-600 mb-3">Mon École en Dauphiné</p>
                    <div className="mt-auto space-y-2">
                      <a href="tel:0660202980" className="w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-50"><Phone size={16} /> 06 60 20 29 80</a>
                      <a href="mailto:bureau@courstommorel.fr" className="w-full py-2 bg-purple-50 text-purple-700 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-purple-100"><Mail size={16} /> Écrire</a>
                    </div>
                  </div>
                </div>
             </div>
          )}

          {['dossiers', 'mes_factures', 'budget', 'notes_frais', 'manage', 'stock'].includes(activeTab) && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center animate-in fade-in">
              <AlertCircle className="text-slate-400 mx-auto mb-4" size={48} /><h3 className="text-xl font-bold text-slate-700">Module en construction</h3>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <h1 className="text-3xl font-bold text-slate-800">Vue d'ensemble</h1>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg"><p className="text-blue-100 text-sm mb-1">Trésorerie Actuelle</p><h3 className="text-3xl font-bold">24 500 €</h3></div>
              </div>
            </div>
          )}
          
          {activeTab === 'etat_financier' && <EtatFinancier planComptable={planComptable} transactionsGlobales={globalTransactions} />}
          {activeTab === 'grand_livre' && <GrandLivre planComptable={planComptable} transactions={journalTransactions} setTransactions={setJournalTransactions} firebaseUser={firebaseUser} globalTransactions={globalTransactions} />}
          {activeTab === 'plan_comptable' && <PlanComptableManager planComptable={planComptable} firebaseUser={firebaseUser} />}
          {activeTab === 'acces' && <GestionAcces firebaseUser={firebaseUser} />}
        </main>
      </div>
    </div>
  );
}
