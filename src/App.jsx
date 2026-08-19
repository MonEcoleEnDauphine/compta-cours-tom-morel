import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, FileSignature, AlertTriangle, CheckCircle,
  Building, Calendar, CreditCard, PieChart, Shield, Lock, FileText, Upload, 
  Trash2, XCircle, RotateCcw, Search, ChevronRight, CheckCircle2, AlertCircle, Paperclip,
  Plus, Save, Sparkles, Receipt, Heart, FileSpreadsheet, Download, Filter, Euro, Info
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, addDoc, getDoc, updateDoc } from "firebase/firestore";

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
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cours-tom-morel';

// VARIABLE DU LOGO MISE À JOUR
const LOGO_URL = "https://lh3.googleusercontent.com/sitesv/AG8ngQXc96dCEFn_IAzMJapefM9CVcMYjacEj4SRG34_lJVisC1M2RC4JkeFV2b8VN30TwAnTJN-HEkeXqfMpIH6JEChx3G9H1CUQ1SZDm-NSmFVdlj6GrkzkC3KCDkK_StXgHclve-6ytuuMw4fYkWcKQqjzjQzYeMm3ScP0VIQbBepycX8NGq429QMYo05=w16383"; 

const EtatFinancier = ({ planComptable, transactionsGlobales }) => {
  const [anneeDebut, setAnneeDebut] = useState(2022);
  
  const periode = useMemo(() => {
    return {
      debut: `${anneeDebut}-09-01`,
      fin: `${anneeDebut + 1}-08-31`,
      label: `Année Scolaire ${anneeDebut}-${anneeDebut + 1}`
    };
  }, [anneeDebut]);

  const transactionsFiltrees = useMemo(() => {
    return transactionsGlobales.filter(t => {
      return t.date >= periode.debut && t.date <= periode.fin;
    });
  }, [periode, transactionsGlobales]);

  const totaux = useMemo(() => {
    let recettes = 0;
    let depenses = 0;
    let actif = 0;
    let passif = 0;
    let soldeBanque = 0;
    
    const parCompte = {};

    transactionsFiltrees.forEach(t => {
      // 1. Calcul de la contrepartie implicite en Banque (512000)
      // Un montant positif importé de la banque augmente le solde.
      soldeBanque += t.montant;

      // 2. Ventilation de la ligne selon le compte choisi
      const comptePrefix = t.compte ? t.compte.charAt(0) : '0';
      let typeCompte = 'autre';
      
      if (comptePrefix === '6') {
          typeCompte = 'charge';
          depenses += Math.abs(t.montant); // En compta, une charge est positive au CR
      } else if (comptePrefix === '7') {
          typeCompte = 'produit';
          recettes += Math.abs(t.montant); // Un produit est positif au CR
      } else if (['1', '2', '3', '4', '5'].includes(comptePrefix)) {
          typeCompte = 'bilan';
      }

      if (!parCompte[t.compte]) {
        parCompte[t.compte] = { montant: 0, type: typeCompte };
      }
      parCompte[t.compte].montant += t.montant; 
    });

    // 3. Intégration dynamique du compte de Banque (512000)
    parCompte['512000'] = { montant: soldeBanque, type: 'bilan_banque' };
    
    if (soldeBanque > 0) actif += soldeBanque;
    else passif += Math.abs(soldeBanque);

    // 4. Calcul de l'Actif et du Passif pour le reste des comptes Bilan
    Object.entries(parCompte).forEach(([c, data]) => {
        if (c !== '512000' && data.type === 'bilan') {
            if (data.montant < 0) passif += Math.abs(data.montant); 
            else actif += data.montant;
        }
    });

    return { 
      recettes, 
      depenses, 
      resultat: recettes - depenses,
      actif,
      passif,
      soldeBanque,
      parCompte: Object.entries(parCompte).map(([compte, data]) => {
        const compteInfo = planComptable.find(c => c.id === compte);
        let label = compteInfo ? compteInfo.label : 'Compte Inconnu';
        if (compte === '512000') label = 'Banque (Solde Contrepartie)';
        
        return {
          compte,
          label: label,
          montantAbsolu: Math.abs(data.montant),
          soldeBrut: data.montant,
          type: data.type
        };
      }).sort((a, b) => b.montantAbsolu - a.montantAbsolu)
    };
  }, [transactionsFiltrees, planComptable]);

  return (
    <div className="space-y-12 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-blue-600" /> État Financier
          </h2>
          <p className="text-slate-500 mt-1">Bilan et Compte de Résultat de l'année scolaire.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={anneeDebut}
            onChange={(e) => setAnneeDebut(Number(e.target.value))}
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

      {/* SECTION COMPTE DE RESULTAT */}
      <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Compte de Résultat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
              <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
                <Plus size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Recettes (Cl. 7)</p>
                <h3 className="text-2xl font-bold text-slate-800">{totaux.recettes.toFixed(2)} €</h3>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 border-l-4 border-l-rose-500">
              <div className="p-4 bg-rose-50 rounded-full text-rose-600">
                <Trash2 size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Dépenses (Cl. 6)</p>
                <h3 className="text-2xl font-bold text-slate-800">{totaux.depenses.toFixed(2)} €</h3>
              </div>
            </div>

            <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 border-l-4 ${totaux.resultat >= 0 ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
              <div className={`p-4 rounded-full ${totaux.resultat >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                <Building size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Résultat Période</p>
                <h3 className={`text-2xl font-bold ${totaux.resultat >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                  {totaux.resultat > 0 ? '+' : ''}{totaux.resultat.toFixed(2)} €
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-rose-50 p-4 border-b border-rose-100 flex justify-between items-center">
                <h3 className="font-bold text-rose-800">Dépenses par poste (Cl. 6)</h3>
                <span className="text-sm font-semibold text-rose-600">{totaux.depenses.toFixed(2)} €</span>
              </div>
              <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                <ul className="divide-y divide-slate-100">
                  {totaux.parCompte.filter(c => c.type === 'charge').map((item, idx) => (
                    <li key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded">{item.compte}</span>
                        <span className="font-medium text-slate-700 truncate max-w-[200px]" title={item.label}>{item.label}</span>
                      </div>
                      <span className="font-semibold text-rose-600">-{item.montantAbsolu.toFixed(2)} €</span>
                    </li>
                  ))}
                  {totaux.parCompte.filter(c => c.type === 'charge').length === 0 && (
                    <li className="p-8 text-center text-slate-400 text-sm">Aucune dépense enregistrée sur cette période.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
                <h3 className="font-bold text-emerald-800">Recettes par poste (Cl. 7)</h3>
                <span className="text-sm font-semibold text-emerald-600">{totaux.recettes.toFixed(2)} €</span>
              </div>
              <div className="p-0 max-h-[400px] overflow-y-auto custom-scrollbar">
                <ul className="divide-y divide-slate-100">
                  {totaux.parCompte.filter(c => c.type === 'produit').map((item, idx) => (
                    <li key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded">{item.compte}</span>
                        <span className="font-medium text-slate-700 truncate max-w-[200px]" title={item.label}>{item.label}</span>
                      </div>
                      <span className="font-semibold text-emerald-600">+{item.montantAbsolu.toFixed(2)} €</span>
                    </li>
                  ))}
                  {totaux.parCompte.filter(c => c.type === 'produit').length === 0 && (
                    <li className="p-8 text-center text-slate-400 text-sm">Aucune recette enregistrée sur cette période.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
      </div>

      {}
      <div className="space-y-6 pt-6">
          <h3 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-2">Bilan Comptable</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between border-l-4 border-l-purple-500">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-purple-50 rounded-full text-purple-600">
                    <Building size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total de l'Actif</p>
                    <h3 className="text-2xl font-bold text-slate-800">{totaux.actif.toFixed(2)} €</h3>
                  </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total du Passif</p>
                    <h3 className="text-2xl font-bold text-slate-800">{totaux.passif.toFixed(2)} €</h3>
                  </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                <div>
                   <h3 className="font-bold text-slate-800">Détail du Bilan (Classes 1 à 5)</h3>
                   <p className="text-xs text-slate-500">Inclut le solde calculé de la banque en contrepartie (512000).</p>
                </div>
             </div>
             <div className="p-0 max-h-[600px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                     <tr>
                        <th className="py-3 px-4">N° Compte</th>
                        <th className="py-3 px-4 w-full">Libellé du compte</th>
                        <th className="py-3 px-4 text-right">Solde Débiteur (Actif)</th>
                        <th className="py-3 px-4 text-right">Solde Créditeur (Passif)</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {totaux.parCompte.filter(c => c.type === 'bilan' || c.type === 'bilan_banque').map((item, idx) => (
                        <tr key={idx} className={`hover:bg-slate-50 transition-colors ${item.compte === '512000' ? 'bg-blue-50/50' : ''}`}>
                           <td className="py-3 px-4">
                              <span className={`font-mono font-bold px-2 py-1 rounded text-sm ${item.compte === '512000' ? 'text-blue-700 bg-blue-100 border-blue-200' : 'text-slate-600 bg-slate-100 border-slate-200'} border`}>
                                {item.compte}
                              </span>
                           </td>
                           <td className="py-3 px-4 text-slate-700 font-medium flex items-center gap-2">
                              {item.label}
                              {item.compte === '512000' && <span className="text-[10px] uppercase bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Auto</span>}
                           </td>
                           <td className="py-3 px-4 text-right font-bold text-slate-600">
                              {item.soldeBrut > 0 ? item.soldeBrut.toFixed(2) + ' €' : '-'}
                           </td>
                           <td className="py-3 px-4 text-right font-bold text-slate-600">
                              {item.soldeBrut < 0 ? Math.abs(item.soldeBrut).toFixed(2) + ' €' : '-'}
                           </td>
                        </tr>
                     ))}
                     {totaux.parCompte.filter(c => c.type === 'bilan' || c.type === 'bilan_banque').length === 0 && (
                        <tr>
                           <td colSpan="4" className="py-8 text-center text-slate-400">Aucun mouvement de bilan enregistré.</td>
                        </tr>
                     )}
                  </tbody>
                </table>
             </div>
          </div>
      </div>
    </div>
  );
};

const GrandLivre = ({ planComptable, transactions, setTransactions, firebaseUser, globalTransactions }) => {
  const [lastImportIds, setLastImportIds] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  
  // État pour le formulaire d'OD
  const [odForm, setOdForm] = useState({ date: '', libelle: '', debit: '', credit: '512000', montant: '' });

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

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        const newTransactions = [];
        const newIds = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const cols = lines[i].split(';');
          if (cols.length >= 7) {
            const dateStr = cols[0].trim();
            const libellePrincipal = cols[1].trim();
            const infosCompl = cols[3] ? cols[3].trim() : '';
            const typeOp = cols[4] ? cols[4].trim() : '';
            
            const libelleComplet = `${libellePrincipal} ${infosCompl ? '('+infosCompl+')' : ''}`.trim();
            
            const debitStr = cols[5].replace(',', '.').replace(/[^-0-9.]/g, '');
            const creditStr = cols[6] ? cols[6].replace(',', '.').replace(/[^-0-9.]/g, '') : '';
            
            let montant = 0;
            if (debitStr && debitStr !== '') montant = parseFloat(debitStr);
            else if (creditStr && creditStr !== '') montant = parseFloat(creditStr);

            const newId = Date.now() + i;
            newIds.push(newId);

            newTransactions.push({
              id: newId, 
              date: dateStr, 
              type: typeOp, 
              libelle: libelleComplet,
              montant: montant, 
              compte: autoImpute(libelleComplet, typeOp),
              status: 'pending'
            });
          }
        }
        setTransactions([...newTransactions, ...transactions]);
        setLastImportIds(newIds);
        showToast(`${newTransactions.length} opérations importées. À vous de les valider !`);
      } catch (err) {
        showToast("Erreur de lecture du fichier CSV.", "error");
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    e.target.value = null;
  };

  const handleValidate = async (t) => {
    if (!firebaseUser) {
        showToast("Vous devez être connecté à la base de données.", "error");
        return;
    }
    if (t.compte === 'ATTENTE') {
      showToast("Veuillez sélectionner un compte avant de valider l'écriture.", "error");
      return;
    }

    let formattedDate = t.date;
    if (t.date.includes('/')) {
      const parts = t.date.split('/');
      if (parts.length === 3) formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    const newGlobalTx = {
      date: formattedDate,
      libelle: t.libelle,
      montant: t.montant,
      type: t.montant > 0 ? 'recette' : 'depense',
      compte: t.compte,
      date_creation: new Date().toISOString()
    };
    
    try {
        const txRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
        await addDoc(txRef, newGlobalTx);
        setTransactions(transactions.filter(tr => tr.id !== t.id));
        showToast("Écriture validée et enregistrée !", "success");
    } catch (e) {
        showToast("Erreur lors de la sauvegarde.", "error");
    }
  };

  const handleAddOD = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!odForm.date || !odForm.libelle || !odForm.montant || !odForm.debit) return;
    
    // Le montant saisi par l'utilisateur est considéré comme un débit sur le compte choisi.
    // L'impact en banque est l'inverse (si dépense, banque diminue = négatif).
    const montantNum = parseFloat(odForm.montant);
    
    const newGlobalTx = {
      date: odForm.date,
      libelle: `(OD) ${odForm.libelle}`,
      montant: -Math.abs(montantNum), // Impact négatif implicite sur 512000
      type: 'depense',
      compte: odForm.debit,
      date_creation: new Date().toISOString()
    };

    try {
        const txRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
        await addDoc(txRef, newGlobalTx);
        showToast("Opération Diverse enregistrée dans le Grand Livre !");
        setOdForm({ date: '', libelle: '', debit: '', credit: '512000', montant: '' });
    } catch(err) {
        showToast("Erreur d'enregistrement de l'OD.", "error");
    }
  };

  const handleUpdateCompte = async (txId, newCompte) => {
      if (!firebaseUser) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId), { compte: newCompte });
          showToast("Compte modifié avec succès dans la base.", "success");
      } catch (e) {
          showToast("Erreur lors de la modification.", "error");
      }
  };

  const handlePdfUploadStub = () => {
      showToast("La fonction d'envoi de PDF vers le Cloud sera activée à la prochaine étape.", "success");
  };

  const validatedTransactions = [...(globalTransactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-8 animate-in fade-in relative">
      {toast && (
        <div className={`absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* 1. ZONE D'IMPORT CSV */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Grand Livre (Import & Saisie)
          </h2>
          <p className="text-slate-500 mt-1">Importez vos relevés bancaires ou saisissez une OD manuelle.</p>
        </div>
        <div className="flex gap-3">
          {lastImportIds.length > 0 && (
            <button onClick={() => {
                setTransactions(transactions.filter(t => !lastImportIds.includes(t.id)));
                setLastImportIds([]);
            }} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
              Annuler le dernier import
            </button>
          )}
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition-colors">
            <Upload size={18} /> Importer un relevé (.csv)
          </button>
        </div>
      </div>
      
      {/* 2. ÉCRITURES EN ATTENTE */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-amber-50 p-3 border-b border-amber-100 flex items-center gap-2 text-amber-800 font-bold">
            <AlertTriangle size={18} /> Lignes du relevé en attente de validation ({transactions.length})
          </div>
          <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Libellé Bancaire</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4">Imputation (Compte)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">{t.date}</td>
                    <td className="py-3 px-4 truncate max-w-[250px]" title={t.libelle}>{t.libelle}</td>
                    <td className={`py-3 px-4 text-right font-bold ${t.montant > 0 ? 'text-emerald-600' : ''}`}>{t.montant} €</td>
                    <td className="py-3 px-4">
                      <select 
                        value={t.compte} 
                        onChange={(e) => setTransactions(transactions.map(tr => tr.id === t.id ? {...tr, compte: e.target.value} : tr))} 
                        className={`p-2 border rounded-md max-w-[200px] bg-white w-full ${t.compte === 'ATTENTE' ? 'border-amber-300 text-amber-700 font-bold' : 'border-slate-200'}`}
                      >
                        <option value="ATTENTE">⚠️ À classer manuellement...</option>
                        {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleValidate(t)} title="Valider l'écriture dans le Grand Livre" className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded transition-colors">
                            <CheckCircle size={20}/>
                        </button>
                        <button onClick={() => setTransactions(transactions.filter(tr => tr.id !== t.id))} title="Supprimer la ligne" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors">
                            <Trash2 size={20}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      )}

      {/* 3. SAISIE OD RAPIDE */}
      <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-800 flex items-center gap-2 mb-3">
          <FileSignature size={16} /> Saisir une Opération Diverse Manuelle (Contrepartie implicite: Banque 512000)
        </h3>
        <form onSubmit={handleAddOD} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-1">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Date</label>
            <input type="date" required value={odForm.date} onChange={e=>setOdForm({...odForm, date: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Libellé</label>
            <input type="text" placeholder="Ex: Ajustement de caisse..." required value={odForm.libelle} onChange={e=>setOdForm({...odForm, libelle: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Compte Débit</label>
            <select required value={odForm.debit} onChange={e=>setOdForm({...odForm, debit: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Sélectionner...</option>
              {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-indigo-400 mb-1">Montant (€)</label>
            <input type="number" step="0.01" required value={odForm.montant} onChange={e=>setOdForm({...odForm, montant: e.target.value})} className="w-full p-2 border border-indigo-200 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">
              Ajouter l'OD
            </button>
          </div>
        </form>
      </div>

      {/* 4. GRAND LIVRE (ÉCRITURES VALIDÉES) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8">
         <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <div>
               <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                 <CheckCircle2 className="text-emerald-500" size={20} /> Écritures Validées au Grand Livre
               </h3>
               <p className="text-xs text-slate-500">Toutes les opérations définitivement enregistrées dans Firebase.</p>
            </div>
            <span className="text-sm font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{validatedTransactions.length} écritures</span>
         </div>
         
         <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            {validatedTransactions.length === 0 ? (
               <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                  <FileText size={48} className="text-slate-200" />
                  Aucune écriture enregistrée dans la base de données. Importez un fichier CSV ou saisissez une OD.
               </div>
            ) : (
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white sticky top-0 shadow-sm text-slate-500 font-bold border-b border-slate-200 z-10 text-xs uppercase tracking-wider">
                     <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Libellé</th>
                        <th className="py-3 px-4 text-right">Mouvement Banque</th>
                        <th className="py-3 px-4">Compte Imputé</th>
                        <th className="py-3 px-4 text-center">Justif. PDF</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {validatedTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                           <td className="py-3 px-4 text-slate-500">{t.date}</td>
                           <td className="py-3 px-4 truncate max-w-[300px] text-slate-700 font-medium" title={t.libelle}>{t.libelle}</td>
                           <td className={`py-3 px-4 text-right font-bold ${t.montant > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {t.montant > 0 ? '+' : ''}{t.montant.toFixed(2)} €
                           </td>
                           <td className="py-3 px-4">
                              <select 
                                 value={t.compte} 
                                 onChange={(e) => handleUpdateCompte(t.id, e.target.value)} 
                                 className="p-1.5 border border-transparent hover:border-blue-300 rounded max-w-[250px] w-full bg-transparent hover:bg-white focus:bg-white focus:border-blue-500 transition-all cursor-pointer text-xs font-mono font-bold text-slate-600"
                              >
                                 {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                              </select>
                           </td>
                           <td className="py-3 px-4 text-center">
                              <button onClick={handlePdfUploadStub} className="text-slate-400 hover:text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-all inline-flex items-center justify-center shadow-sm border border-transparent hover:border-blue-200" title="Joindre une facture PDF">
                                 <Paperclip size={16} />
                              </button>
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
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const fileInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!newId || !newLabel) return;
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', newId), { label: newLabel });
        setNewId(''); setNewLabel('');
        showToast("Compte enregistré dans Firebase !");
    } catch(err) { showToast("Erreur d'enregistrement.", "error"); }
  };

  const removeCompte = async (id) => {
    if (!firebaseUser) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', id));
        showToast("Compte supprimé.");
    } catch(err) { showToast("Erreur de suppression.", "error"); }
  };

  const handleImportCSV = (e) => {
    if (!firebaseUser) return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split(/\r?\n/);
        let count = 0;
        for (let i = 0; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(/[;,]/);
          if (cols.length >= 2) {
            const numeroStr = cols[0].trim().replace(/['"]/g, '');
            const libelleStr = cols[1].trim().replace(/['"]/g, '');
            if (numeroStr.match(/^[0-9]+$/) && numeroStr.length >= 2) {
               await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', numeroStr), { label: libelleStr });
               count++;
            }
          }
        }
        showToast(`${count} comptes importés avec succès !`);
      } catch (err) { showToast("Erreur CSV.", "error"); }
    };
    reader.readAsText(file, 'ISO-8859-1');
    e.target.value = null; 
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto relative">
      {toast && (
        <div className={`absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          <CheckCircle2 size={18} /> {toast.message}
        </div>
      )}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><BookOpen className="text-purple-600"/> Plan Comptable</h2>
        <div>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"><Upload size={18}/> Importer un Plan (.csv)</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">N° de Compte</label>
            <input type="text" required placeholder="Ex: 606100" value={newId} onChange={e=>setNewId(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Libellé du compte</label>
            <input type="text" required placeholder="Ex: Eau et électricité" value={newLabel} onChange={e=>setNewLabel(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md font-medium text-sm h-[38px]"><Plus size={16}/></button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-h-[500px] overflow-y-auto">
        <div className="divide-y divide-slate-100">
          {planComptable.length === 0 ? <div className="p-8 text-center text-slate-500 text-sm">Base de données vide.</div> : 
            planComptable.map(compte => (
              <div key={compte.id} className="p-4 flex justify-between items-center hover:bg-slate-50 group">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-sm">{compte.id}</span>
                  <span className="font-medium text-slate-700">{compte.label}</span>
                </div>
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
        <div>
          <h2 className="text-2xl font-bold">Gestion des Accès</h2>
          <p className="text-slate-300 mt-1 text-sm">Définissez la vue (Admin ou Famille) pour chaque identifiant.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr><th className="py-3 px-4">Identifiant</th><th className="py-3 px-4">Droits actuels (Vue)</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-700">{u.identifiant}</td>
                <td className="py-3 px-4">
                  <select value={u.role} onChange={(e) => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid), {role: e.target.value})} className="p-2 border rounded-md">
                    <option value="famille">Vue Famille</option><option value="admin">Vue Admin</option>
                  </select>
                </td>
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
    } catch (err) { setError("Erreur de connexion. Vérifiez vos identifiants ou créez un accès."); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md">
        <div className="text-center mb-8">
           <img src={LOGO_URL} alt="Logo Cours Tom Morel" className="h-24 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-800">Portail Sécurisé</h1>
          <p className="text-slate-500 mt-2">Cours Tom Morel - Saint-Chef</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2"><XCircle size={18}/>{error}</div>}
        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Identifiant</label>
            <input type="text" value={identifiant} onChange={e=>setIdentifiant(e.target.value)} required placeholder="ex: dupont" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700">{isRegistering ? "Créer mon compte" : "Se connecter"}</button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => {setIsRegistering(!isRegistering); setError('');}} className="text-sm text-blue-600 hover:underline">{isRegistering ? "Déjà un compte ? Se connecter" : "Pas de compte ? Créer un accès"}</button></div>
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
    } catch (e) { console.error("Erreur profile", e); }
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
      
      {/* SIDEBAR NAVIGATION */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 overflow-y-auto custom-scrollbar">
        <div className="p-6 bg-slate-950/50 flex flex-col items-center border-b border-slate-800 shrink-0">
          <img src={LOGO_URL} alt="Logo" className="h-16 w-16 mb-3 object-contain rounded-xl bg-white p-1" />
          <h1 className="text-lg font-bold text-white tracking-wide">Cours Tom Morel</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">ERP - Version {isAdmin ? 'Admin' : 'Famille'}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          <div>
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Espace Famille</h3>
             <ul className="space-y-1">
                <li><button onClick={() => setActiveTab('infos')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'infos' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Info size={18} /> Infos & Contact</button></li>
                <li><button onClick={() => setActiveTab('dossiers')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dossiers' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><GraduationCap size={18} /> Scolarité (Dossiers)</button></li>
                <li><button onClick={() => setActiveTab('mes_factures')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'mes_factures' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Receipt size={18} /> Mes Factures</button></li>
             </ul>
          </div>
          <div>
             <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Plannings Parents</h3>
             <ul className="space-y-1">
                <li><button onClick={() => setActiveTab('menage')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'menage' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Sparkles size={18} /> Ménage Week-end</button></li>
                <li><button onClick={() => setActiveTab('garde')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'garde' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Users size={18} /> Garde Cantine / Cour</button></li>
             </ul>
          </div>

          {isAdmin && (
            <>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Pilotage</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><LayoutDashboard size={18} /> Tableau de Bord</button></li>
                  <li><button onClick={() => setActiveTab('etat_financier')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'etat_financier' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}><PieChart size={18} /> État Financier (Bilan)</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Comptabilité & Finances</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('grand_livre')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'grand_livre' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><BookOpen size={18} /> Grand Livre</button></li>
                  <li><button onClick={() => setActiveTab('plan_comptable')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'plan_comptable' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><FileSignature size={18} /> Plan Comptable</button></li>
                  <li><button onClick={() => setActiveTab('notes_frais')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'notes_frais' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><FileText size={18} /> Notes de Frais</button></li>
                  <li><button onClick={() => setActiveTab('dons')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'dons' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Heart size={18} /> Dons & Mécénat</button></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Administration</h3>
                <ul className="space-y-1">
                  <li><button onClick={() => setActiveTab('factures_familles')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'factures_familles' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><FileSpreadsheet size={18} /> Factures Familles</button></li>
                  <li><button onClick={() => setActiveTab('contrats')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'contrats' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Users size={18} /> Équipe (Contrats)</button></li>
                  <li><button onClick={() => setActiveTab('uniformes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'uniformes' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Shield size={18} /> Uniformes & Stock</button></li>
                  <li><button onClick={() => setActiveTab('acces')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'acces' ? 'bg-slate-700 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><Lock size={18} /> Gestion des Accès</button></li>
                </ul>
              </div>
            </>
          )}
        </nav>
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0"><button onClick={() => signOut(auth)} className="w-full py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-300 rounded text-sm font-medium flex justify-center items-center gap-2"><XCircle size={16}/> Déconnexion</button></div>
      </div>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div className="flex-1 overflow-auto relative bg-slate-50">
        <header className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm mt-8 md:mt-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' && "Tableau de Bord"}
              {activeTab === 'etat_financier' && "État Financier (Bilan & Résultat)"}
              {activeTab === 'infos' && "Informations & Contact"}
              {activeTab === 'dossiers' && "Dossiers de Scolarité"}
              {activeTab === 'mes_factures' && "Mes Factures Famille"}
              {activeTab === 'menage' && "Planning Ménage"}
              {activeTab === 'garde' && "Planning Garde Cantine/Cour"}
              {activeTab === 'grand_livre' && "Grand Livre Comptable"}
              {activeTab === 'plan_comptable' && "Gestion du Plan Comptable"}
              {activeTab === 'notes_frais' && "Notes de Frais"}
              {activeTab === 'dons' && "Dons & Mécénat"}
              {activeTab === 'factures_familles' && "Facturation des Familles"}
              {activeTab === 'contrats' && "Contrats & Équipe"}
              {activeTab === 'uniformes' && "Gestion des Uniformes"}
              {activeTab === 'acces' && "Gestion des Accès"}
            </h2>
          </div>
          <div className="flex items-center gap-4 hidden md:flex">
             <div className="text-right">
               <div className="text-sm font-bold text-slate-700 capitalize">{currentUser.identifiant}</div>
               <div className="text-xs text-slate-500 mt-1">Profil : {isAdmin ? 'Admin' : 'Famille'}</div>
             </div>
             <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold uppercase">{currentUser.identifiant.charAt(0)}</div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {activeTab === 'infos' && (
             <div className="space-y-6">
                <div className="bg-blue-600 rounded-xl p-8 text-white shadow-md">
                   <h2 className="text-3xl font-bold mb-2">Bienvenue sur le portail du Cours Tom Morel</h2>
                   <p className="text-blue-100 text-lg">Retrouvez ici toutes les informations de scolarité et les plannings.</p>
                </div>
             </div>
          )}

          {['dossiers', 'mes_factures', 'menage', 'garde', 'notes_frais', 'dons', 'factures_familles', 'contrats', 'uniformes'].includes(activeTab) && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center animate-in fade-in">
              <AlertCircle className="text-slate-400 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-700 mb-2">Module en construction</h3>
              <p className="text-slate-500">Ce module n'est pas encore relié à la base de données.</p>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-end mb-2">
                <div><h1 className="text-3xl font-bold text-slate-800">Vue d'ensemble</h1></div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium border border-indigo-100"><Calendar size={18} /> 2026-2027</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10"><div className="p-3 bg-white/20 rounded-xl"><Building size={24} className="text-white" /></div></div>
                  <p className="text-blue-100 text-sm font-medium mb-1 relative z-10">Trésorerie Actuelle</p><h3 className="text-3xl font-bold relative z-10">24 500 €</h3>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10"><div className="p-3 bg-white/20 rounded-xl"><Users size={24} className="text-white" /></div></div>
                  <p className="text-emerald-100 text-sm font-medium mb-1 relative z-10">Familles Inscrites</p><h3 className="text-3xl font-bold relative z-10">42</h3>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg shadow-amber-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10"><div className="p-3 bg-white/20 rounded-xl"><Euro size={24} className="text-white" /></div></div>
                  <p className="text-amber-100 text-sm font-medium mb-1 relative z-10">Factures en attente</p><h3 className="text-3xl font-bold relative z-10">1 250 €</h3>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10"><div className="p-3 bg-white/20 rounded-xl"><Sparkles size={24} className="text-white" /></div></div>
                  <p className="text-purple-100 text-sm font-medium mb-1 relative z-10">Créneaux de garde vides</p><h3 className="text-3xl font-bold relative z-10">4</h3>
                </div>
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
