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

// VARIABLE DU LOGO (A remplacer par votre lien d'image si vous en avez un)
const LOGO_URL = ""; 

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
    const parCompte = {};

    transactionsFiltrees.forEach(t => {
      let typeOperation = 'autre';
      if (t.compte && t.compte.startsWith('6')) typeOperation = 'depense';
      else if (t.compte && t.compte.startsWith('7')) typeOperation = 'recette';
      else typeOperation = t.montant > 0 ? 'recette' : 'depense';

      if (t.montant > 0) recettes += t.montant;
      if (t.montant < 0) depenses += Math.abs(t.montant);

      if (!parCompte[t.compte]) {
        parCompte[t.compte] = { montant: 0, type: typeOperation };
      }
      parCompte[t.compte].montant += t.montant;
    });

    return { 
      recettes, 
      depenses, 
      resultat: recettes - depenses,
      parCompte: Object.entries(parCompte).map(([compte, data]) => {
        const compteInfo = planComptable.find(c => c.id === compte);
        return {
          compte,
          label: compteInfo ? compteInfo.label : 'Compte Inconnu / À classer',
          montant: Math.abs(data.montant),
          type: data.type
        };
      }).sort((a, b) => b.montant - a.montant)
    };
  }, [transactionsFiltrees, planComptable]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-blue-600" /> État Financier
          </h2>
          <p className="text-slate-500 mt-1">Bilan comptable basé sur l'année scolaire de l'association.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Filter size={18} className="text-slate-400 ml-2" />
          <span className="text-sm font-medium text-slate-600">Période :</span>
          <select 
            value={anneeDebut}
            onChange={(e) => setAnneeDebut(Number(e.target.value))}
            className="p-2 border rounded-md text-sm bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-4 bg-emerald-50 rounded-full text-emerald-600">
            <Plus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Recettes</p>
            <h3 className="text-2xl font-bold text-slate-800">{totaux.recettes.toFixed(2)} €</h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="p-4 bg-rose-50 rounded-full text-rose-600">
            <Trash2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Dépenses</p>
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
            <h3 className="font-bold text-rose-800">Dépenses par poste</h3>
            <span className="text-sm font-semibold text-rose-600">{totaux.depenses.toFixed(2)} €</span>
          </div>
          <div className="p-0 max-h-[500px] overflow-y-auto">
            <ul className="divide-y divide-slate-100">
              {totaux.parCompte.filter(c => c.type === 'depense').map((item, idx) => (
                <li key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.compte}</span>
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.label}</span>
                  </div>
                  <span className="font-semibold text-rose-600">-{item.montant.toFixed(2)} €</span>
                </li>
              ))}
              {totaux.parCompte.filter(c => c.type === 'depense').length === 0 && (
                <li className="p-8 text-center text-slate-400 text-sm">Aucune dépense enregistrée sur cette période.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-emerald-50 p-4 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="font-bold text-emerald-800">Recettes par poste</h3>
            <span className="text-sm font-semibold text-emerald-600">{totaux.recettes.toFixed(2)} €</span>
          </div>
          <div className="p-0 max-h-[500px] overflow-y-auto">
            <ul className="divide-y divide-slate-100">
              {totaux.parCompte.filter(c => c.type === 'recette').map((item, idx) => (
                <li key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.compte}</span>
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{item.label}</span>
                  </div>
                  <span className="font-semibold text-emerald-600">+{item.montant.toFixed(2)} €</span>
                </li>
              ))}
              {totaux.parCompte.filter(c => c.type === 'recette').length === 0 && (
                <li className="p-8 text-center text-slate-400 text-sm">Aucune recette enregistrée sur cette période.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const JournalBanque = ({ planComptable, transactions, setTransactions, firebaseUser, globalTransactions }) => {
  const [lastImportIds, setLastImportIds] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const autoImpute = (libelle, typeOp) => {
    const text = (libelle + " " + typeOp).toLowerCase();
    
    // Frais bancaires et cotisations
    if (text.includes('frais') || text.includes('extournes') || text.includes('cotisation') || 
        text.includes('forfait') || text.includes('bl association') || text.includes('commission') || text.includes('agios')) {
        return '627000'; // Services bancaires et assimilés
    }
    
    // Fournitures et petits équipements
    if (text.includes('bureau') || text.includes('fournitures') || text.includes('papeterie') || text.includes('amazon')) {
        return '606400'; // Fournitures administratives
    }
    if (text.includes('livre') || text.includes('manuel') || text.includes('scolaire') || text.includes('pedagogique')) {
        return '606800'; // Autres matières et fournitures (ex: pédagogique)
    }

    // Loyer et charges
    if (text.includes('loyer') || text.includes('sci ') || text.includes('location')) {
        return '613200'; // Locations immobilières
    }
    if (text.includes('edf') || text.includes('engie') || text.includes('eau ') || text.includes('electricite')) {
        return '606100'; // Fournitures non stockables (eau, énergie)
    }
    if (text.includes('assurance') || text.includes('mutuelle') || text.includes('axa ') || text.includes('macif')) {
        return '616000'; // Primes d'assurances
    }
    
    // Entretien et nettoyage
    if (text.includes('menage') || text.includes('nettoyage') || text.includes('entretien')) {
        return '615000'; // Entretien et réparations
    }

    // Salaires et cotisations sociales
    if (text.includes('salaire') || text.includes('virement ') && (text.includes('prof') || text.includes('enseignant'))) {
        return '641000'; // Rémunérations du personnel
    }
    if (text.includes('urssaf') || text.includes('retraite') || text.includes('pole emploi')) {
        return '645000'; // Charges de sécurité sociale et de prévoyance
    }

    // Recettes (Dons, Scolarité, Plateformes)
    if (text.includes('helloasso') || text.includes('stripe')) {
        // Souvent un compte d'attente avant ventilation précise (dons vs scolarité)
        return '471000'; // Compte d'attente
    }
    if (text.includes('scolarite') || text.includes('cantine') || text.includes('inscription')) {
        return '706000'; // Prestations de services (Scolarité)
    }
    if (text.includes('don ') || text.includes('mecenat') || text.includes('soutien')) {
        return '754000'; // Collectes (Dons) ou 758000 (Dons manuels) - À adapter selon votre plan
    }

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
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
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
        showToast("Écriture validée et enregistrée dans Firebase !", "success");
    } catch (e) {
        console.error("Erreur d'écriture :", e);
        showToast("Erreur lors de la sauvegarde dans Firebase.", "error");
    }
  };

  const handleUpdateCompte = async (txId, newCompte) => {
      if (!firebaseUser) return;
      try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', txId), {
              compte: newCompte
          });
          showToast("Compte modifié avec succès.", "success");
      } catch (e) {
          showToast("Erreur lors de la modification.", "error");
      }
  };

  const handlePdfUploadStub = () => {
      showToast("La fonction d'envoi de PDF sera activée à la prochaine étape (Firebase Storage).", "error");
  };

  // Trier les écritures validées de la plus récente à la plus ancienne
  const validatedTransactions = [...(globalTransactions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6 animate-in fade-in relative">
      {toast && (
        <div className={`absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* ZONE D'IMPORT (EN ATTENTE) */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="text-blue-600" /> Journal de Banque
          </h2>
          <p className="text-slate-500 mt-1">Importez vos relevés pour générer les écritures bancaires dans la base.</p>
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
      
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="bg-amber-50 p-3 border-b border-amber-100 flex items-center gap-2 text-amber-800 font-bold">
            <AlertTriangle size={18} /> Écritures en attente de validation ({transactions.length})
          </div>
          <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Libellé</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4">Compte</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">{t.date}</td>
                    <td className="py-3 px-4 truncate max-w-[250px]" title={t.libelle}>{t.libelle}</td>
                    <td className="py-3 px-4 text-right font-bold">{t.montant} €</td>
                    <td className="py-3 px-4">
                      <select 
                        value={t.compte} 
                        onChange={(e) => setTransactions(transactions.map(tr => tr.id === t.id ? {...tr, compte: e.target.value} : tr))} 
                        className={`p-2 border rounded-md max-w-[200px] bg-white w-full`}
                      >
                        <option value="ATTENTE">⚠️ À classer manuellement...</option>
                        {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleValidate(t)} title="Valider l'écriture dans Firebase" className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded transition-colors">
                            <CheckCircle size={18}/>
                        </button>
                        <button onClick={() => setTransactions(transactions.filter(tr => tr.id !== t.id))} title="Supprimer la ligne" className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors">
                            <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
      )}

      {/* GRAND LIVRE (ÉCRITURES VALIDÉES) */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
         <div className="bg-blue-50 p-4 border-b border-blue-200 flex justify-between items-center">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
               <BookOpen size={18} /> Grand Livre (Écritures Validées)
            </h3>
            <span className="text-sm font-semibold text-blue-600">{validatedTransactions.length} écritures</span>
         </div>
         <div className="max-h-[500px] overflow-y-auto">
            {validatedTransactions.length === 0 ? (
               <div className="p-8 text-center text-slate-400 text-sm">
                  Aucune écriture validée dans la base de données.
               </div>
            ) : (
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white sticky top-0 shadow-sm text-slate-600 font-medium border-b border-slate-200 z-10">
                     <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Libellé</th>
                        <th className="py-3 px-4 text-right">Montant</th>
                        <th className="py-3 px-4">Compte Imputé</th>
                        <th className="py-3 px-4 text-center">Justificatif</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {validatedTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                           <td className="py-3 px-4 text-slate-500">{t.date}</td>
                           <td className="py-3 px-4 truncate max-w-[300px] text-slate-700" title={t.libelle}>{t.libelle}</td>
                           <td className={`py-3 px-4 text-right font-bold ${t.montant > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                              {t.montant > 0 ? '+' : ''}{t.montant.toFixed(2)} €
                           </td>
                           <td className="py-3 px-4">
                              <select 
                                 value={t.compte} 
                                 onChange={(e) => handleUpdateCompte(t.id, e.target.value)} 
                                 className="p-1 border border-transparent hover:border-slate-300 rounded max-w-[200px] bg-transparent hover:bg-white focus:bg-white focus:border-blue-500 transition-all cursor-pointer text-xs font-mono"
                              >
                                 {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
                              </select>
                           </td>
                           <td className="py-3 px-4 text-center">
                              <button onClick={handlePdfUploadStub} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors inline-flex items-center justify-center" title="Ajouter un PDF">
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

const OperationsDiverses = ({ planComptable, firebaseUser }) => {
  const [formData, setFormData] = useState({ date: '', libelle: '', debit: '', credit: '421000', montant: '' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!formData.date || !formData.libelle || !formData.montant || !formData.debit) return;
    
    const newGlobalTx = {
      date: formData.date,
      libelle: formData.libelle,
      montant: -Math.abs(parseFloat(formData.montant)),
      type: 'depense',
      compte: formData.debit,
      date_creation: new Date().toISOString()
    };

    try {
        const txRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
        await addDoc(txRef, newGlobalTx);
        showToast("Opération Diverse enregistrée dans Firebase !");
        setFormData({ date: '', libelle: '', debit: '', credit: '421000', montant: '' });
    } catch(err) {
        showToast("Erreur d'enregistrement.", "error");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in relative">
      {toast && (
        <div className={`absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 bg-green-100 text-green-700 border border-green-200`}>
          <CheckCircle2 size={18} /> {toast.message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <FileSignature className="text-indigo-600" /> Saisie Opérations Diverses (OD)
        </h2>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
            <input type="date" required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-500 mb-1">Libellé de l'écriture</label>
            <input type="text" placeholder="Ex: Ajustement caisse..." required value={formData.libelle} onChange={e=>setFormData({...formData, libelle: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Compte Débit</label>
            <select required value={formData.debit} onChange={e=>setFormData({...formData, debit: e.target.value})} className="w-full p-2 border rounded-md text-sm">
              <option value="">Sélectionner...</option>
              {planComptable.map(c => <option key={c.id} value={c.id}>{c.id} - {c.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">Montant (€)</label>
            <input type="number" step="0.01" required value={formData.montant} onChange={e=>setFormData({...formData, montant: e.target.value})} className="w-full p-2 border rounded-md text-sm" />
          </div>
          <div className="md:col-span-1">
            <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
              <Plus size={16}/> Enregistrer
            </button>
          </div>
        </form>
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
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', newId), {
            label: newLabel
        });
        setNewId('');
        setNewLabel('');
        showToast("Compte enregistré dans Firebase !");
    } catch(err) {
        showToast("Erreur lors de l'enregistrement.", "error");
    }
  };

  const removeCompte = async (id) => {
    if (!firebaseUser) return;
    try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', id));
        showToast("Compte supprimé de la base.");
    } catch(err) {
        showToast("Erreur lors de la suppression.", "error");
    }
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
               await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'plan_comptable', numeroStr), {
                   label: libelleStr
               });
               count++;
            }
          }
        }
        showToast(`${count} comptes importés avec succès dans Firebase !`);
      } catch (err) {
        showToast("Erreur lors de la lecture du fichier CSV.", "error");
      }
    };
    reader.readAsText(file, 'ISO-8859-1');
    e.target.value = null; 
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto relative">
      {toast && (
        <div className={`absolute top-0 right-0 mt-4 mr-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <BookOpen className="text-purple-600" size={28} />
          <h2 className="text-2xl font-bold text-slate-800">Plan Comptable</h2>
        </div>
        <div>
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
          <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-purple-700 transition-colors">
            <Upload size={18} /> Importer un Plan (.csv)
          </button>
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
          <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-sm transition-colors flex items-center gap-2 h-[38px]">
            <Plus size={16}/> Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {planComptable.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              La base de données est vide. Importez un fichier CSV ou ajoutez un compte manuellement.
            </div>
          ) : (
            planComptable.map((compte) => (
              <div key={compte.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-sm">{compte.id}</span>
                  <span className="font-medium text-slate-700">{compte.label}</span>
                </div>
                <button onClick={() => removeCompte(compte.id)} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-all">
                  <Trash2 size={18}/>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const GestionAcces = ({ firebaseUser }) => {
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!firebaseUser) return;
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
    const unsub = onSnapshot(usersRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setUsers(data);
    });
    return () => unsub();
  }, [firebaseUser]);

  const changerRole = async (uid, nouveauRole) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', uid), {
        role: nouveauRole
      });
      setToast({ message: "Droits mis à jour avec succès !", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({ message: "Erreur lors de la mise à jour.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-4xl relative">
      {toast && (
        <div className="absolute top-0 right-0 mt-4 p-4 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2 bg-green-100 text-green-700">
          <CheckCircle2 size={18} /> {toast.message}
        </div>
      )}
      
      <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-full"><Lock size={24} className="text-blue-300"/></div>
        <div>
          <h2 className="text-2xl font-bold">Gestion des Accès</h2>
          <p className="text-slate-300 mt-1 text-sm">Définissez la vue (Admin ou Famille) pour chaque identifiant enregistré.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Identifiant de connexion</th>
              <th className="py-3 px-4">Droits actuels (Vue)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-700">{u.identifiant}</td>
                <td className="py-3 px-4">
                  <select 
                    value={u.role} 
                    onChange={(e) => changerRole(u.uid, e.target.value)}
                    className={`p-2 border rounded-md text-sm font-medium ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    <option value="famille">Vue Famille (Restreint)</option>
                    <option value="admin">Vue Admin (Accès Total)</option>
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
    e.preventDefault();
    setError('');
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
    } catch (err) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError("Identifiant ou mot de passe incorrect.");
      else if (err.code === 'auth/email-already-in-use') setError("Cet identifiant est déjà utilisé.");
      else if (err.code === 'auth/operation-not-allowed') setError("La connexion par mot de passe est désactivée dans Firebase.");
      else setError("Erreur de connexion.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          {LOGO_URL ? (
             <img src={LOGO_URL} alt="Logo Cours Tom Morel" className="h-24 mx-auto mb-4 object-contain" />
          ) : (
             <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl shadow-xl flex items-center justify-center mb-4 border-4 border-white">
                <GraduationCap size={48} className="text-white" />
             </div>
          )}
          <h1 className="text-2xl font-bold text-slate-800">Portail Sécurisé</h1>
          <p className="text-slate-500 mt-2">Cours Tom Morel - Saint-Chef</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <XCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Identifiant</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" value={identifiant} onChange={e=>setIdentifiant(e.target.value)} required placeholder="ex: dupont ou admin"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex justify-center items-center gap-2">
            {isRegistering ? "Créer mon compte" : "Se connecter"} <ChevronRight size={18} />
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <button 
              onClick={() => {setIsRegistering(!isRegistering); setError('');}}
              className="text-sm text-blue-600 hover:underline"
            >
              {isRegistering ? "Déjà un compte ? Se connecter" : "Pas de compte ? Créer un accès"}
            </button>
        </div>
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
      
      let role = 'famille';
      let identifiant = identifiantFromLogin || user.email.split('@')[0];

      if (userSnap.exists()) {
        role = userSnap.data().role;
        identifiant = userSnap.data().identifiant || identifiant;
      } else if (isNewRegistration || identifiant === 'admin') {
        role = identifiant === 'admin' ? 'admin' : 'famille';
        await setDoc(userRef, { 
          identifiant: identifiant, 
          role: role, 
          createdAt: new Date().toISOString() 
        });
      }

      setCurrentUser({ identifiant: identifiant, role: role, uid: user.uid });
      setActiveTab(role === 'admin' ? 'dashboard' : 'infos');
    } catch (e) {
      console.error("Erreur de chargement du profil:", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && !currentUser) {
         loadUserProfile(user);
      } else if (!user) {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!firebaseUser) return;
    const pcRef = collection(db, 'artifacts', appId, 'public', 'data', 'plan_comptable');
    const unsubPc = onSnapshot(pcRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlanComptable(data.sort((a, b) => a.id.localeCompare(b.id)));
    });

    const txRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
    const unsubTx = onSnapshot(txRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGlobalTransactions(data);
    });

    return () => { unsubPc(); unsubTx(); };
  }, [firebaseUser]);

  if (!currentUser) {
    return <LoginScreen onLogin={(user, identifiant, isNew) => loadUserProfile(user, identifiant, isNew)} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* SIDEBAR NAVIGATION - MENU COMPLET RESTAURE */}
      <div className="w-72 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20 overflow-y-auto custom-scrollbar">
        <div className="p-6 bg-slate-950/50 flex flex-col items-center border-b border-slate-800 shrink-0">
          {LOGO_URL ? (
              <img src={LOGO_URL} alt="Logo" className="h-16 w-16 mb-3 object-contain rounded-xl bg-white p-1" />
          ) : (
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-xl flex items-center justify-center mb-3 shadow-lg border-2 border-white/10">
                <GraduationCap size={32} className="text-white" />
              </div>
          )}
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
                  <li><button onClick={() => setActiveTab('journal_banque')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'journal_banque' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><CreditCard size={18} /> Journal de Banque</button></li>
                  <li><button onClick={() => setActiveTab('od')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'od' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><FileSignature size={18} /> Opérations Diverses (OD)</button></li>
                  <li><button onClick={() => setActiveTab('plan_comptable')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeTab === 'plan_comptable' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}><BookOpen size={18} /> Plan Comptable</button></li>
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
        
        <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
           <button onClick={() => signOut(auth)} className="w-full py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 text-slate-300 rounded transition-colors text-sm font-medium flex justify-center items-center gap-2">
             <XCircle size={16}/> Déconnexion
           </button>
        </div>
      </div>

      {/* ZONE DE CONTENU PRINCIPALE */}
      <div className="flex-1 overflow-auto relative bg-slate-50">
        <div className="absolute top-0 right-0 p-2 text-xs font-bold z-50 flex items-center gap-2">
          {firebaseUser ? (
             <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1 shadow-sm"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Firebase Connecté</span>
          ) : (
             <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200 flex items-center gap-1 shadow-sm">Déconnecté</span>
          )}
        </div>

        <header className="bg-white px-8 py-5 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10 shadow-sm mt-8 md:mt-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeTab === 'dashboard' && "Tableau de Bord"}
              {activeTab === 'etat_financier' && "État Financier de l'Association"}
              {activeTab === 'infos' && "Informations & Contact"}
              {activeTab === 'dossiers' && "Dossiers de Scolarité"}
              {activeTab === 'mes_factures' && "Mes Factures Famille"}
              {activeTab === 'menage' && "Planning Ménage"}
              {activeTab === 'garde' && "Planning Garde Cantine/Cour"}
              {activeTab === 'journal_banque' && "Rapprochement Bancaire"}
              {activeTab === 'od' && "Opérations Diverses"}
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
               <div className="text-xs text-slate-500 mt-1">Profil : {currentUser.role === 'admin' ? 'Admin' : 'Famille'}</div>
             </div>
             <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 uppercase">
               {currentUser.identifiant.charAt(0)}
             </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto">
          {/* VUES SIMPLES / PLACEHOLDERS POUR LES MODULES NON CONNECTES */}
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
              <p className="text-slate-500">Ce module n'est pas encore relié à la nouvelle base de données Firebase.</p>
            </div>
          )}

          {/* TABLEAU DE BORD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">Vue d'ensemble</h1>
                  <p className="text-slate-500 mt-1">Bienvenue sur le centre de pilotage de l'association.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium border border-indigo-100">
                  <Calendar size={18} /> Année Scolaire 2026-2027
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl"><Building size={24} className="text-white" /></div>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">+ 2.4%</span>
                  </div>
                  <p className="text-blue-100 text-sm font-medium mb-1 relative z-10">Trésorerie Actuelle</p>
                  <h3 className="text-3xl font-bold relative z-10">24 500 €</h3>
                </div>
                
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl"><Users size={24} className="text-white" /></div>
                    <span className="bg-emerald-800/40 px-2 py-1 rounded flex items-center gap-1 text-xs font-medium backdrop-blur-sm"><CheckCircle size={12}/> À jour</span>
                  </div>
                  <p className="text-emerald-100 text-sm font-medium mb-1 relative z-10">Familles Inscrites</p>
                  <h3 className="text-3xl font-bold relative z-10">42</h3>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg shadow-amber-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl"><Euro size={24} className="text-white" /></div>
                    <span className="bg-red-500/80 px-2 py-1 rounded flex items-center gap-1 text-xs font-medium backdrop-blur-sm"><AlertCircle size={12}/> 3 retards</span>
                  </div>
                  <p className="text-amber-100 text-sm font-medium mb-1 relative z-10">Factures en attente</p>
                  <h3 className="text-3xl font-bold relative z-10">1 250 €</h3>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-purple-200 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-xl"><Sparkles size={24} className="text-white" /></div>
                  </div>
                  <p className="text-purple-100 text-sm font-medium mb-1 relative z-10">Créneaux de garde vides</p>
                  <h3 className="text-3xl font-bold relative z-10">4</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Raccourcis rapides</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button onClick={() => setActiveTab('journal_banque')} className="p-4 border border-slate-100 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-blue-200 transition-colors group">
                    <CreditCard className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-600">Saisir la banque</span>
                  </button>
                  <button onClick={() => setActiveTab('notes_frais')} className="p-4 border border-slate-100 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-emerald-200 transition-colors group">
                    <FileSignature className="text-emerald-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-600">Nouvelle NDF</span>
                  </button>
                  <button onClick={() => setActiveTab('dons')} className="p-4 border border-slate-100 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-rose-200 transition-colors group">
                    <Heart className="text-rose-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-600">Saisir un don</span>
                  </button>
                  <button onClick={() => setActiveTab('factures_familles')} className="p-4 border border-slate-100 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-50 hover:border-amber-200 transition-colors group">
                    <FileText className="text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium text-slate-600">Facturer</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* MODULES CONNECTÉS À FIREBASE */}
          {activeTab === 'etat_financier' && <EtatFinancier planComptable={planComptable} transactionsGlobales={globalTransactions} />}
          {activeTab === 'journal_banque' && <JournalBanque planComptable={planComptable} transactions={journalTransactions} setTransactions={setJournalTransactions} firebaseUser={firebaseUser} globalTransactions={globalTransactions} />}
          {activeTab === 'od' && <OperationsDiverses planComptable={planComptable} firebaseUser={firebaseUser} />}
          {activeTab === 'plan_comptable' && <PlanComptableManager planComptable={planComptable} firebaseUser={firebaseUser} />}
          {activeTab === 'acces' && <GestionAcces firebaseUser={firebaseUser} />}
          
        </main>
      </div>
    </div>
  );
}
