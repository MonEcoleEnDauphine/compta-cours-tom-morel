import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Users, Receipt, HeartHandshake, Plus, 
  FileText, CheckCircle, CreditCard, Download, Presentation,
  ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, BarChart3,
  X, PieChart as PieChartIcon, Calendar, Clock, UserCheck,
  BookOpen, Upload, FileSpreadsheet, Shield
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

const THEME_COLOR = '#0066b3'; 
const THEME_COLOR_LIGHT = '#e6f0f7'; 
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];
const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  if (percent < 0.03) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="#ffffff" 
      textAnchor="middle" 
      dominantBaseline="central"
      className="text-sm font-bold"
      style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Vider toutes les données pour avoir une application 100% vierge
const initialTransactions = [];
const initialFamilies = [];
const initialParents = [];
const initialPeriscolaire = [];
const initialExpenseReports = [];
const initialDonors = [];

const financialStatements = {
  '2025/2026': {
    bilanActif: [],
    bilanPassif: [],
    resultat: []
  }
};

const chartDataYearly = [];
const chartDataTreasury = [];

// Les données des graphiques seront maintenant calculées automatiquement
// const chartDataIncome2526 = [];
// const chartDataExpenses2526 = [];

const planComptable = [
  { compte: '110000', libelle: 'Report à nouveau', type: 'Capitaux propres' },
  { compte: '120000', libelle: 'Résultat de l\'exercice', type: 'Capitaux propres' },
  { compte: '411000', libelle: 'Créances Clients (Familles)', type: 'Actif circulant' },
  { compte: '512000', libelle: 'Banque Crédit Mutuel', type: 'Trésorerie' },
  { compte: '601000', libelle: 'Achats de livres scolaires', type: 'Charges' },
  { compte: '606100', libelle: 'Energie (Eau, Électricité)', type: 'Charges' },
  { compte: '613200', libelle: 'Locations immobilières (Loyer)', type: 'Charges' },
  { compte: '641100', libelle: 'Salaires brut', type: 'Charges' },
  { compte: '706001', libelle: 'Frais de scolarité', type: 'Produits' },
  { compte: '754000', libelle: 'Dons manuels et mécénat', type: 'Produits' },
];

// DÉFINITION DES ONGLETS ET DE LEURS ACCÈS (RÔLES)
const ALL_TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord', roles: ['admin', 'tresorier', 'president', 'benevole'] },
  { id: 'accounting', icon: CreditCard, label: 'Journal & OD', roles: ['admin', 'tresorier'] },
  { id: 'plan', icon: BookOpen, label: 'Plan Comptable', roles: ['admin', 'tresorier'] },
  { id: 'billing', icon: Users, label: 'Familles & Factures', roles: ['admin', 'tresorier'] },
  { id: 'parents', icon: UserCheck, label: 'Suivi Parents', roles: ['admin', 'president'] },
  { id: 'periscolaire', icon: Clock, label: 'Périscolaire 27/28', roles: ['admin', 'president'] },
  { id: 'expenses', icon: Receipt, label: 'Notes de frais', roles: ['admin', 'tresorier', 'president', 'benevole'] },
  { id: 'donors', icon: HeartHandshake, label: 'Dons & Mécénat', roles: ['admin', 'tresorier', 'president'] },
  { id: 'statements', icon: PieChartIcon, label: 'États Financiers', roles: ['admin', 'tresorier'] },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('admin'); // Simulateur de connexion
  
  const [transactions, setTransactions] = useState(initialTransactions);
  const [families, setFamilies] = useState(initialFamilies);
  const [parents, setParents] = useState(initialParents);
  const [periscolaire, setPeriscolaire] = useState(initialPeriscolaire);
  const [expenseReports, setExpenseReports] = useState(initialExpenseReports);
  const [donors, setDonors] = useState(initialDonors);
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [toast, setToast] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ date: '', journal: 'BANQUE', account: '', accountLabel: '', label: '', debit: '', credit: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGoogleSheetsData = useCallback(async () => {
    setIsLoading(true);
    const SHEET_ID = '1jy4IPjSoIBHnu3OHnmXfu2YhV2tNv6gf6WlaxbTjtLU';
    const API_KEY = 'AIzaSyDg92oZrigWKq6RcKloQfHn0476880dT-Y';
    // On lit les colonnes A à K (pour inclure tes colonnes Libellé et Compte) à partir de la ligne 2
    const RANGE = 'A2:K'; 
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
         console.error("Erreur API:", data.error);
         showToast("Erreur API : " + data.error.message, "error");
         return;
      }

      if (data.values) {
        const formattedData = data.values.map((row, index) => {
          // Fonction pour nettoyer les montants (ex: "-7,00" devient 7.00 ou "250,00" devient 250.00)
          const parseAmount = (val) => {
            if (!val) return null;
            // On enlève le signe moins éventuel, les espaces, on remplace la virgule par un point
            const cleanVal = val.toString().replace('-', '').replace('€', '').trim().replace(',', '.');
            const parsed = parseFloat(cleanVal);
            return isNaN(parsed) ? null : parsed;
          };

          return {
            id: index, // On utilise la position dans le tableau comme ID
            date: row[0] || '', // Colonne A: Date comptable
            journal: 'BANQUE', // On force BANQUE vu que c'est un relevé
            account: row[10] || 'À CLASSER', // Colonne K: Compte (ou 'À CLASSER' si vide)
            accountLabel: row[9] || '', // Colonne J: Libellé du compte
            label: row[3] || row[1] || '', // Colonne D (Infos comp) ou Colonne B (Libellé simplifié)
            debit: parseAmount(row[5]), // Colonne F: Débit
            credit: parseAmount(row[6]), // Colonne G: Crédit
          };
        });
        
        // On inverse pour avoir les opérations les plus récentes en haut du tableau
        setTransactions(formattedData.reverse());
        showToast("Données synchronisées avec succès !");
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Erreur de connexion à Google Sheets:", error);
      showToast("Erreur de connexion réseau au document", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoogleSheetsData();
  }, [fetchGoogleSheetsData]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUserRole(newRole);
    // Si l'onglet actuel n'est pas autorisé pour le nouveau rôle, on renvoie au tableau de bord
    const currentTabInfo = ALL_TABS.find(t => t.id === activeTab);
    if (currentTabInfo && !currentTabInfo.roles.includes(newRole)) {
      setActiveTab('dashboard');
    }
  };

  const handleAddTx = (e) => {
    e.preventDefault();
    const parsedDebit = newTx.debit ? parseFloat(newTx.debit) : null;
    const parsedCredit = newTx.credit ? parseFloat(newTx.credit) : null;
    
    const tx = {
      id: Date.now(),
      date: newTx.date.split('-').reverse().join('/'),
      journal: newTx.journal,
      account: newTx.account,
      accountLabel: newTx.accountLabel,
      label: newTx.label,
      debit: parsedDebit,
      credit: parsedCredit
    };
    
    setTransactions([tx, ...transactions]);
    setShowAddModal(false);
    setNewTx({ date: '', journal: 'BANQUE', account: '', accountLabel: '', label: '', debit: '', credit: '' });
    showToast("Écriture ajoutée avec succès ! (Temporaire avant connexion Google Sheets)");
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '';
    return parseFloat(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const syncWithGoogleSheets = () => {
    fetchGoogleSheetsData();
  };

  const totalDons2526 = donors.reduce((sum, d) => sum + d.totalDonated, 0);
  
  // Calcul automatique des revenus depuis les comptes commençant par '7'
  const chartDataIncome2526 = useMemo(() => {
    const incomes = {};
    transactions.forEach(t => {
      if (t.account && String(t.account).startsWith('7') && t.credit) {
        const label = t.accountLabel || `Compte ${t.account}`;
        incomes[label] = (incomes[label] || 0) + t.credit;
      }
    });
    return Object.entries(incomes).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Calcul automatique des dépenses depuis les comptes commençant par '6'
  const chartDataExpenses2526 = useMemo(() => {
    const expenses = {};
    transactions.forEach(t => {
      if (t.account && String(t.account).startsWith('6') && t.debit) {
         const label = t.accountLabel || `Compte ${t.account}`;
        expenses[label] = (expenses[label] || 0) + t.debit;
      }
    });
    return Object.entries(expenses).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const totalIncome2526 = chartDataIncome2526.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses2526 = chartDataExpenses2526.reduce((sum, item) => sum + item.value, 0);

  // Calcul de la trésorerie totale (Compte 512 Banque)
  const tresorerieTotal = transactions.reduce((sum, t) => {
    // Si c'est un relevé bancaire, le débit (de la banque) augmente notre compte, le crédit le diminue.
    // Attention : souvent sur les relevés, un "crédit" (+ sur le relevé) est une rentrée d'argent (Débit 512 en compta).
    // Sur ton image du 26/01/2022, 250,00 est en Crédit. Si c'est un Don (rentrée d'argent), c'est +250 pour la banque.
    // On va supposer que Crédit = Rentrée (+) et Débit = Dépense (-) d'après ton format.
    return sum + (t.credit || 0) - (t.debit || 0);
  }, 0);

  // --- DYNAMISATION DE L'ANNÉE DU TABLEAU DE BORD ---
  const getFiscalYear = (dateStr) => {
    if (!dateStr) return 'Non défini';
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 'Non défini';
    
    // Essayer de parser la date. Format attendu : JJ/MM/AAAA
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    
    // Gérer les années sur 2 chiffres (ex: '22' -> 2022)
    if (year < 100) {
      year += 2000;
    }

    if (isNaN(month) || isNaN(year)) return 'Non défini';
    
    // Exercice comptable : du 01/09 au 31/08
    if (month >= 9) {
      return `${year}/${year + 1}`;
    } else {
      return `${year - 1}/${year}`;
    }
  };

  // Trouver toutes les années disponibles et prendre la plus récente
  const availableYears = [...new Set(transactions.map(t => getFiscalYear(t.date)).filter(y => y !== 'Non défini'))].sort().reverse();
  const currentDashboardYear = availableYears.length > 0 ? availableYears[0] : 'Année en cours';
  const shortDashboardYear = currentDashboardYear.replace('20', '').replace('/20', '/'); // ex: "2021/2022" -> "21/22"

  // Recalculer les totaux de Dons pour l'année en cours affichée sur le dashboard
  const currentYearTransactions = transactions.filter(t => getFiscalYear(t.date) === currentDashboardYear);
  
  const totalDonsCurrentYear = currentYearTransactions.reduce((sum, t) => {
      // On cherche les comptes 754 (Dons)
      if (t.account && String(t.account).startsWith('754')) {
          return sum + (t.credit || 0) - (t.debit || 0); // Les dons sont au crédit
      }
      return sum;
  }, 0);

  // Calcul automatique des revenus et dépenses pour les graphiques de l'année en cours
  const chartDataIncomeCurrent = useMemo(() => {
    const incomes = {};
    currentYearTransactions.forEach(t => {
      if (t.account && String(t.account).startsWith('7') && t.credit) {
        const label = t.accountLabel || `Compte ${t.account}`;
        incomes[label] = (incomes[label] || 0) + t.credit;
      }
    });
    return Object.entries(incomes).map(([name, value]) => ({ name, value }));
  }, [currentYearTransactions]);

  const chartDataExpensesCurrent = useMemo(() => {
    const expenses = {};
    currentYearTransactions.forEach(t => {
      if (t.account && String(t.account).startsWith('6') && t.debit) {
         const label = t.accountLabel || `Compte ${t.account}`;
        expenses[label] = (expenses[label] || 0) + t.debit;
      }
    });
    return Object.entries(expenses).map(([name, value]) => ({ name, value }));
  }, [currentYearTransactions]);

  const totalIncomeCurrent = chartDataIncomeCurrent.reduce((sum, item) => sum + item.value, 0);
  const totalExpensesCurrent = chartDataExpensesCurrent.reduce((sum, item) => sum + item.value, 0);


  // Filtrer les onglets selon le rôle de l'utilisateur
  const visibleTabs = ALL_TABS.filter(tab => tab.roles.includes(userRole));

  const DashboardModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            Tableau de bord - Mon Ecole en Dauphiné
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Connecté en tant que : <strong className="text-blue-600 capitalize">{userRole}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200 font-medium">
            <Presentation size={18} /> Mode Présentation AG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 flex flex-col justify-center" style={{borderLeftColor: THEME_COLOR}}>
          <h3 className="text-gray-500 text-sm font-medium">Trésorerie Actuelle</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(tresorerieTotal)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Dons Récoltés <span className="text-xs font-normal">({shortDashboardYear})</span></h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(totalDonsCurrentYear)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Créances Familles</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">0,00 €</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Résultat {shortDashboardYear}</h3>
          <p className="text-2xl font-bold text-gray-600 mt-1">{formatCurrency(totalIncomeCurrent - totalExpensesCurrent)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 justify-center" style={{color: THEME_COLOR}}>
            <HeartHandshake size={20} /> Répartition des Recettes ({currentDashboardYear})
          </h3>
          {chartDataIncomeCurrent.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-slate-800 mb-6">{formatCurrency(totalIncomeCurrent)}</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataIncomeCurrent} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
                      {chartDataIncomeCurrent.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 h-full">
              <PieChartIcon size={48} className="mb-4 opacity-20" />
              <p>Aucune recette pour le moment</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-lg font-semibold text-red-500 mb-2 flex items-center gap-2 justify-center">
            <PieChartIcon size={20} /> Répartition des Dépenses ({currentDashboardYear})
          </h3>
          {chartDataExpensesCurrent.length > 0 ? (
            <>
              <p className="text-2xl font-bold text-slate-800 mb-6">{formatCurrency(totalExpensesCurrent)}</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataExpensesCurrent} cx="50%" cy="50%" innerRadius={50} outerRadius={100} paddingAngle={3} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
                      {chartDataExpensesCurrent.map((entry, index) => <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center text-gray-400 h-full">
              <PieChartIcon size={48} className="mb-4 opacity-20" />
              <p>Aucune dépense pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const AccountingModule = () => {
    return (
      <div className="space-y-4 h-full flex flex-col pb-8">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Journal de Banque & OD</h2>
            <p className="text-gray-500 text-sm mt-1">Affichage de l'intégralité des écritures</p>
          </div>
          <div className="flex gap-2">
            <button onClick={syncWithGoogleSheets} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 shadow-sm font-medium">
              <FileSpreadsheet size={18} /> Connecter Google Sheets
            </button>
            <input type="file" accept=".txt,.csv" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { if(e.target.files[0]) showToast(`Fichier ${e.target.files[0].name} importé !`); }} />
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm">
              <Upload size={18} /> Importer TXT/CSV
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg shadow-sm" style={{backgroundColor: THEME_COLOR}}>
              <Plus size={18} /> Nouvelle Écriture
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                <tr className="border-b border-gray-200">
                  <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Journal</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Compte</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Libellé Pièce</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Débit</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Crédit</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map(t => (
                    <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 text-sm whitespace-nowrap">{t.date}</td>
                      <td className="p-4 text-sm"><span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">{t.journal}</span></td>
                      <td className="p-4 text-sm font-mono">{t.account}</td>
                      <td className="p-4 text-sm">{t.label}</td>
                      <td className="p-4 text-sm text-right">{t.debit ? formatCurrency(t.debit) : ''}</td>
                      <td className="p-4 text-sm text-right">{t.credit ? formatCurrency(t.credit) : ''}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium text-lg">Le journal est vide.</p>
                      <p className="text-gray-400 text-sm mt-1">Connectez votre Google Sheets ou ajoutez une écriture manuellement.</p>
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

  const ChartOfAccountsModule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Plan Comptable</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600 text-sm">N° Compte</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Libellé</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
            </tr>
          </thead>
          <tbody>
            {planComptable.map((acc, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-mono font-bold">{acc.compte}</td>
                <td className="p-4">{acc.libelle}</td>
                <td className="p-4"><span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs border border-gray-200">{acc.type}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const ExpensesModule = () => {
    const validateExpense = (id, actionRole) => {
      setExpenseReports(reports => reports.map(r => {
        if (r.id === id) {
          if (actionRole === 'tresorier' && r.status === 'En attente') return { ...r, status: 'Validé (Trésorier)' };
          if (actionRole === 'president' && r.status === 'Validé (Trésorier)') return { ...r, status: 'Validé (Président & Trésorier)' };
        }
        return r;
      }));
      showToast(`Note validée par le ${actionRole === 'tresorier' ? 'Trésorier' : 'Président'}.`);
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div><h2 className="text-2xl font-bold text-gray-800">Notes de Frais & Abandons</h2></div>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg" style={{backgroundColor: THEME_COLOR}}><Plus size={18} /> Saisir Frais</button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Nom</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Description</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Montant</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Statut</th>
                {(userRole === 'admin' || userRole === 'tresorier' || userRole === 'president') && (
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Actions de Validation</th>
                )}
              </tr>
            </thead>
            <tbody>
              {expenseReports.length > 0 ? (
                expenseReports.map(frais => (
                  <tr key={frais.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium">{frais.name}</td>
                    <td className="p-4 text-sm">{frais.desc}</td>
                    <td className="p-4 font-bold text-right">{formatCurrency(frais.amount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${frais.status.includes('Président') ? 'bg-green-100 text-green-800' : frais.status.includes('Trésorier') ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                        {frais.status}
                      </span>
                    </td>
                    {(userRole === 'admin' || userRole === 'tresorier' || userRole === 'president') && (
                      <td className="p-4 flex gap-2 justify-center">
                        {(userRole === 'admin' || userRole === 'tresorier') && (
                          <button onClick={() => validateExpense(frais.id, 'tresorier')} disabled={frais.status !== 'En attente'} className={`px-3 py-1 text-xs rounded border ${frais.status === 'En attente' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
                            Trésorier
                          </button>
                        )}
                        {(userRole === 'admin' || userRole === 'president') && (
                          <button onClick={() => validateExpense(frais.id, 'president')} disabled={frais.status !== 'Validé (Trésorier)'} className={`px-3 py-1 text-xs rounded border ${frais.status === 'Validé (Trésorier)' ? 'border-green-300 text-green-700 bg-green-50' : 'border-gray-200 text-gray-400 bg-gray-50'}`}>
                            Président
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Aucune note de frais pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const BillingModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Familles & Facturation</h2></div>
  );
  const ParentsModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Suivi des Parents</h2></div>
  );
  const DonorsModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Dons & Mécénat</h2></div>
  );
  const PeriscolaireModule = () => (
    <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Suivi Périscolaire</h2></div>
  );

  const FinancialStatementsModule = () => {
    // Déduire toutes les années scolaires existantes
    const [localYear, setLocalYear] = useState(currentDashboardYear);

    // Filtrer les écritures
    const periodTransactions = transactions.filter(t => getFiscalYear(t.date) === localYear);
    
    // --- CALCUL DU COMPTE DE RÉSULTAT (Comptes 6 et 7 de l'année sélectionnée) ---
    const chargesList = [];
    const produitsList = [];
    let totalCharges = 0;
    let totalProduits = 0;

    const accountsSummary = {};
    periodTransactions.forEach(t => {
      const acc = String(t.account);
      if (acc.startsWith('6') || acc.startsWith('7')) {
        if (!accountsSummary[acc]) {
          accountsSummary[acc] = { label: t.accountLabel || 'À définir', amount: 0, type: acc.startsWith('6') ? 'charge' : 'produit' };
        }
        if (acc.startsWith('6')) {
          accountsSummary[acc].amount += (t.debit || 0) - (t.credit || 0);
        } else {
          accountsSummary[acc].amount += (t.credit || 0) - (t.debit || 0);
        }
      }
    });

    Object.entries(accountsSummary).forEach(([acc, data]) => {
      if (data.type === 'charge' && data.amount !== 0) {
        chargesList.push({ account: acc, ...data });
        totalCharges += data.amount;
      } else if (data.type === 'produit' && data.amount !== 0) {
        produitsList.push({ account: acc, ...data });
        totalProduits += data.amount;
      }
    });

    chargesList.sort((a, b) => a.account.localeCompare(b.account));
    produitsList.sort((a, b) => a.account.localeCompare(b.account));
    
    const resultat = totalProduits - totalCharges;

    // --- CALCUL DU BILAN (Comptes 1 à 5 + reconstitution de la Trésorerie) ---
    // Pour simplifier à partir d'un relevé bancaire, le Bilan est :
    // Actif = Trésorerie à la fin de l'exercice
    // Passif = Résultat de l'exercice + Report à nouveau (historique)
    
    // 1. Calcul de la trésorerie à la fin de l'année sélectionnée (et avant)
    const transactionsUpToYear = transactions.filter(t => {
       const txYear = getFiscalYear(t.date);
       // On garde si l'année de transaction est inférieure ou égale à l'année locale
       return txYear <= localYear; 
    });

    const tresorerieBilan = transactionsUpToYear.reduce((sum, t) => {
        return sum + (t.credit || 0) - (t.debit || 0);
    }, 0);

    // 2. Calcul du résultat historique (Report à nouveau) : tout ce qui s'est passé AVANT l'année sélectionnée
    const transactionsBeforeYear = transactions.filter(t => getFiscalYear(t.date) < localYear);
    
    let historiqueProduits = 0;
    let historiqueCharges = 0;
    
    transactionsBeforeYear.forEach(t => {
        const acc = String(t.account);
        if (acc.startsWith('7')) historiqueProduits += (t.credit || 0) - (t.debit || 0);
        if (acc.startsWith('6')) historiqueCharges += (t.debit || 0) - (t.credit || 0);
    });
    
    const reportANouveau = historiqueProduits - historiqueCharges;

    // 3. Construction des tableaux pour l'affichage
    const actifList = [];
    if (tresorerieBilan !== 0) {
        actifList.push({ account: '512000', label: 'Banque', amount: tresorerieBilan });
    }
    const totalActif = tresorerieBilan;

    const passifList = [];
    if (reportANouveau !== 0) {
        passifList.push({ account: '110000', label: 'Report à nouveau', amount: reportANouveau });
    }
    if (resultat !== 0) {
        passifList.push({ account: '120000', label: 'Résultat de l\'exercice', amount: resultat });
    }
    const totalPassif = reportANouveau + resultat;


    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <PieChartIcon className="text-blue-600" /> États Financiers
            </h2>
            <p className="text-sm text-gray-500 mt-1">Génération automatique du Bilan et Compte de Résultat</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-600">Exercice Comptable :</label>
            <select 
              value={localYear} 
              onChange={(e) => setLocalYear(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold"
            >
              {availableYears.length > 0 ? (
                availableYears.map(year => <option key={year} value={year}>{year}</option>)
              ) : (
                <option value="Année en cours">Année en cours</option>
              )}
            </select>
          </div>
        </div>

        {/* --- LE BILAN COMPTABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-slate-700 text-white p-4">
            <h3 className="text-lg font-bold text-center">BILAN AU 31/08 - EXERCICE {localYear}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* ACTIF */}
            <div>
              <div className="bg-blue-50 p-3 border-b border-blue-100">
                <h4 className="font-bold text-blue-800">ACTIF (Emplois)</h4>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {actifList.map(a => (
                    <tr key={a.account} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-500 w-20">{a.account}</td>
                      <td className="p-3">{a.label}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(a.amount)}</td>
                    </tr>
                  ))}
                  {actifList.length === 0 && (
                    <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">Aucun actif enregistré.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="p-4 text-right">TOTAL ACTIF</td>
                    <td className="p-4 text-right text-blue-700">{formatCurrency(totalActif)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* PASSIF */}
            <div>
              <div className="bg-purple-50 p-3 border-b border-purple-100">
                <h4 className="font-bold text-purple-800">PASSIF (Ressources)</h4>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {passifList.map(p => (
                    <tr key={p.account} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-500 w-20">{p.account}</td>
                      <td className="p-3">{p.label}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                  {passifList.length === 0 && (
                    <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">Aucun passif enregistré.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="p-4 text-right">TOTAL PASSIF</td>
                    <td className="p-4 text-right text-purple-700">{formatCurrency(totalPassif)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
           {/* Contrôle de l'équilibre du Bilan */}
           <div className={`p-3 text-center text-xs font-bold ${Math.abs(totalActif - totalPassif) < 0.01 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {Math.abs(totalActif - totalPassif) < 0.01 ? '✓ Le bilan est équilibré' : `⚠ Déséquilibre de ${formatCurrency(totalActif - totalPassif)}`}
           </div>
        </div>

        {/* --- LE COMPTE DE RÉSULTAT --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-800 text-white p-4">
            <h3 className="text-lg font-bold text-center">COMPTE DE RÉSULTAT - EXERCICE {localYear}</h3>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-600">Exercice Comptable :</label>
            <select 
              value={localYear} 
              onChange={(e) => setLocalYear(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 font-bold"
            >
              {availableYears.length > 0 ? (
                availableYears.map(year => <option key={year} value={year}>{year}</option>)
              ) : (
                <option value="2025/2026">2025/2026</option>
              )}
            </select>
          </div>
        </div>

        {/* COMPTE DE RÉSULTAT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-800 text-white p-4">
            <h3 className="text-lg font-bold text-center">COMPTE DE RÉSULTAT - {localYear}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {/* CHARGES */}
            <div>
              <div className="bg-red-50 p-3 border-b border-red-100">
                <h4 className="font-bold text-red-800">CHARGES (Dépenses)</h4>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {chargesList.map(c => (
                    <tr key={c.account} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-500 w-20">{c.account}</td>
                      <td className="p-3">{c.label}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(c.amount)}</td>
                    </tr>
                  ))}
                  {chargesList.length === 0 && (
                    <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">Aucune charge sur cet exercice.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="p-4 text-right">TOTAL DES CHARGES</td>
                    <td className="p-4 text-right text-red-600">{formatCurrency(totalCharges)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* PRODUITS */}
            <div>
              <div className="bg-green-50 p-3 border-b border-green-100">
                <h4 className="font-bold text-green-800">PRODUITS (Recettes)</h4>
              </div>
              <table className="w-full text-left text-sm">
                <tbody>
                  {produitsList.map(p => (
                    <tr key={p.account} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-500 w-20">{p.account}</td>
                      <td className="p-3">{p.label}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(p.amount)}</td>
                    </tr>
                  ))}
                  {produitsList.length === 0 && (
                    <tr><td colSpan="3" className="p-6 text-center text-gray-400 italic">Aucun produit sur cet exercice.</td></tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                  <tr>
                    <td colSpan="2" className="p-4 text-right">TOTAL DES PRODUITS</td>
                    <td className="p-4 text-right text-green-600">{formatCurrency(totalProduits)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* RÉSULTAT */}
          <div className={`p-6 flex justify-between items-center border-t-4 ${resultat >= 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <h3 className="text-xl font-bold uppercase">Résultat de l'exercice</h3>
            <div className="text-right">
              <span className={`text-2xl font-bold ${resultat >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(resultat)}
              </span>
              <p className={`text-sm font-medium mt-1 ${resultat >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {resultat >= 0 ? '(Bénéfice)' : '(Déficit)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Écran de chargement lors de la synchro avec Google Sheets */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
           <p className="text-blue-800 font-bold text-xl drop-shadow-md">Synchronisation avec Google Sheets...</p>
        </div>
      )}

      <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 border-r border-gray-200">
        <div className="p-6 border-b border-gray-100 flex flex-col items-center">
          <img src="bleu fond blanc-2_2.png" alt="Logo" className="w-40 h-auto mb-6 object-contain" onError={(e) => { e.target.src = 'https://via.placeholder.com/150x80?text=Logo'; }}/>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleTabs.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`} style={activeTab === item.id ? {backgroundColor: THEME_COLOR} : {}}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        {/* SÉLECTEUR DE RÔLE (Simulateur de connexion) */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
            <Shield size={14} /> Sélecteur de rôle
          </label>
          <select value={userRole} onChange={handleRoleChange} className="w-full bg-white border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 shadow-sm">
            <option value="admin">Administrateur (Tout voir)</option>
            <option value="president">Président</option>
            <option value="tresorier">Trésorier</option>
            <option value="benevole">Bénévole / Parent</option>
          </select>
        </div>
      </aside>

      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        <div className="h-full w-full overflow-y-auto p-8">
            {activeTab === 'dashboard' && <DashboardModule />}
            {activeTab === 'accounting' && <AccountingModule />}
            {activeTab === 'plan' && <ChartOfAccountsModule />}
            {activeTab === 'billing' && <BillingModule />}
            {activeTab === 'parents' && <ParentsModule />}
            {activeTab === 'periscolaire' && <PeriscolaireModule />}
            {activeTab === 'expenses' && <ExpensesModule />}
            {activeTab === 'donors' && <DonorsModule />}
            {activeTab === 'statements' && <FinancialStatementsModule />}
        </div>
      </main>

      {}
      {/* Modal d'ajout d'écriture */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Nouvelle Écriture</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddTx} className="space-y-4">
              <div><input type="date" required value={newTx.date} onChange={e => setNewTx({...newTx, date: e.target.value})} className="w-full border p-2 text-sm rounded" /></div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="N° Compte" value={newTx.account} onChange={e => setNewTx({...newTx, account: e.target.value})} className="border p-2 text-sm rounded" />
                <input type="text" placeholder="Libellé" value={newTx.label} onChange={e => setNewTx({...newTx, label: e.target.value})} className="border p-2 text-sm rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" step="0.01" placeholder="Débit €" value={newTx.debit} onChange={e => setNewTx({...newTx, debit: e.target.value, credit: ''})} disabled={newTx.credit !== ''} className="border p-2 text-sm rounded" />
                <input type="number" step="0.01" placeholder="Crédit €" value={newTx.credit} onChange={e => setNewTx({...newTx, credit: e.target.value, debit: ''})} disabled={newTx.debit !== ''} className="border p-2 text-sm rounded" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 text-white rounded" style={{backgroundColor: THEME_COLOR}}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {}
      {toast && (
        <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-xl z-50">
          <CheckCircle className="text-green-400" size={20} />
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 text-slate-400"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
