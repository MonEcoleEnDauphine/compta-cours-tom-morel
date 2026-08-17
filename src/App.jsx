import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, Receipt, HeartHandshake, Plus, 
  FileText, CheckCircle, CreditCard, Download, Presentation,
  ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, BarChart3,
  X, PieChart as PieChartIcon, Calendar, Clock, UserCheck
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

const initialTransactions = [
  // Nouvelles opérations bancaires (Juillet 2026)
  { id: 10001, date: '22/07/2026', journal: 'BANQUE', account: '606100', accountLabel: 'Energie', label: 'PRLV ENGIE', debit: 193.04, credit: null },
  { id: 10002, date: '22/07/2026', journal: 'BANQUE', account: '442100', accountLabel: 'Etat - Prélèvement à la source', label: 'PRLV B2B SIE LA TOUR DU PIN', debit: 116.00, credit: null },
  { id: 10003, date: '21/07/2026', journal: 'BANQUE', account: '754000', accountLabel: 'Don', label: 'VIR SEPA FAMILLE ESPERANCE', debit: null, credit: 20000.00 },
  { id: 10004, date: '20/07/2026', journal: 'BANQUE', account: '613200', accountLabel: 'Loyer', label: 'VIR SEPA SERVICE GESTION COMPTAB', debit: 1228.18, credit: null },

  // Abandons de frais (OD de notes de frais validées)
  { id: 2000, date: '08/06/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel travaux - SARL C-MAT', debit: 215.67, credit: null },
  { id: 2001, date: '08/06/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - SARL C-MAT', debit: null, credit: 215.67 },
  { id: 2002, date: '08/06/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel travaux - SARL C-MAT', debit: 204.80, credit: null },
  { id: 2003, date: '08/06/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - SARL C-MAT', debit: null, credit: 204.80 },
  { id: 2004, date: '06/10/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Yesss électrique - FAUVAIN Luc', debit: 438.76, credit: null },
  { id: 2005, date: '06/10/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 438.76 },
  { id: 2006, date: '27/03/2024', journal: 'OD', account: '606400', accountLabel: 'Consommables', label: 'Support comm - FAUVAIN Marie-Pia', debit: 44.00, credit: null },
  { id: 2007, date: '27/03/2024', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN M-P', debit: null, credit: 44.00 },
  { id: 2008, date: '01/02/2024', journal: 'OD', account: '606400', accountLabel: 'Consommables', label: 'Support comm - FAUVAIN Marie-Pia', debit: 38.38, credit: null },
  { id: 2009, date: '01/02/2024', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN M-P', debit: null, credit: 38.38 },
  { id: 2010, date: '08/04/2024', journal: 'OD', account: '606400', accountLabel: 'Consommables', label: 'Support comm - FAUVAIN Marie-Pia', debit: 36.58, credit: null },
  { id: 2011, date: '08/04/2024', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN M-P', debit: null, credit: 36.58 },
  { id: 2012, date: '03/08/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel travaux - FAUVAIN Luc', debit: 16.50, credit: null },
  { id: 2013, date: '03/08/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 16.50 },
  { id: 2014, date: '22/08/2023', journal: 'OD', account: '606400', accountLabel: 'Consommables', label: 'Matériel scolaire - FAUVAIN Luc', debit: 32.97, credit: null },
  { id: 2015, date: '22/08/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 32.97 },
  { id: 2016, date: '26/08/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Plomberie - FAUVAIN Luc', debit: 32.13, credit: null },
  { id: 2017, date: '26/08/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 32.13 },
  { id: 2018, date: '20/06/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel patere - FAUVAIN Luc', debit: 53.54, credit: null },
  { id: 2019, date: '20/06/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 53.54 },
  { id: 2020, date: '07/10/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel travaux - FAUVAIN Luc', debit: 20.45, credit: null },
  { id: 2021, date: '07/10/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 20.45 },
  { id: 2022, date: '08/06/2023', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Installation - SARL C-MAT', debit: 34.90, credit: null },
  { id: 2023, date: '08/06/2023', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - SARL C-MAT', debit: null, credit: 34.90 },
  { id: 2024, date: '02/03/2024', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel travaux - FAUVAIN Luc', debit: 20.50, credit: null },
  { id: 2025, date: '02/03/2024', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 20.50 },
  { id: 2026, date: '23/09/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Boite clé - TAISSIDRE David', debit: 30.58, credit: null },
  { id: 2027, date: '23/09/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - TAISSIDRE', debit: null, credit: 30.58 },
  { id: 2028, date: '05/06/2025', journal: 'OD', account: '616800', accountLabel: 'Assurance', label: 'Assurance multopro - SARL C-MAT', debit: 517.77, credit: null },
  { id: 2029, date: '05/06/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - SARL C-MAT', debit: null, credit: 517.77 },
  { id: 2030, date: '03/10/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Travaux élec - BÉZIAT-MENUT L.', debit: 14.39, credit: null },
  { id: 2031, date: '03/10/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - BÉZIAT-MENUT L.', debit: null, credit: 14.39 },
  { id: 2032, date: '02/10/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Travaux électricité - BÉZIAT-MENUT L.', debit: 29.84, credit: null },
  { id: 2033, date: '02/10/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - BÉZIAT-MENUT L.', debit: null, credit: 29.84 },
  { id: 2034, date: '07/10/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Travaux plomberie - BÉZIAT-MENUT L.', debit: 14.69, credit: null },
  { id: 2035, date: '07/10/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - BÉZIAT-MENUT L.', debit: null, credit: 14.69 },
  { id: 2036, date: '29/09/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Travaux élec 3 - BÉZIAT-MENUT L.', debit: 181.72, credit: null },
  { id: 2037, date: '29/09/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - BÉZIAT-MENUT L.', debit: null, credit: 181.72 },
  { id: 2038, date: '28/06/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Matériel Weldon - FAUVAIN Luc', debit: 350.53, credit: null },
  { id: 2039, date: '28/06/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 350.53 },
  { id: 2040, date: '29/08/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Petit matériel - FAUVAIN Luc', debit: 66.70, credit: null },
  { id: 2041, date: '29/08/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 66.70 },
  { id: 2042, date: '27/08/2025', journal: 'OD', account: '615000', accountLabel: 'Entretiens et réparations', label: 'Petit matériel - FAUVAIN Luc', debit: 37.55, credit: null },
  { id: 2043, date: '27/08/2025', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - FAUVAIN Luc', debit: null, credit: 37.55 },
  { id: 2044, date: '27/04/2026', journal: 'OD', account: '601000', accountLabel: 'Stock / Livres', label: 'Livres scolaires - GADIOLET B.', debit: 15.25, credit: null },
  { id: 2045, date: '27/04/2026', journal: 'OD', account: '754000', accountLabel: 'Don', label: 'Abandon de frais - GADIOLET B.', debit: null, credit: 15.25 },

  // Historique OD & PAIE
  { id: 1, date: '31/08/2026', journal: 'OD', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'REGUL 09/2025 à 08/2026', debit: -3.1, credit: null },
  { id: 2, date: '31/08/2026', journal: 'OD', account: '778000', accountLabel: 'Autres produits exceptionnels', label: 'REGUL 09/2025 à 08/2026', debit: null, credit: -3.1 },
  { id: 3, date: '31/08/2026', journal: 'OD', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'REGUL 09/2025 à 08/2026', debit: 1.72, credit: null },
  { id: 4, date: '31/08/2026', journal: 'OD', account: '778000', accountLabel: 'Autres produits exceptionnels', label: 'REGUL 09/2025 à 08/2026', debit: null, credit: 1.72 },
  { id: 5, date: '31/08/2026', journal: 'OD', account: '411000', accountLabel: 'Créance clients KAIROS', label: 'Année 2025/2026', debit: 2653.7, credit: null },
  { id: 6, date: '31/08/2026', journal: 'OD', account: '740000', accountLabel: 'Subvention fonds sociaux', label: 'Année 2025/2026', debit: null, credit: 2653.7 },
  { id: 7, date: '30/06/2026', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2606', debit: null, credit: 3795.68 },
  { id: 8, date: '30/06/2026', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2606', debit: null, credit: 2284.22 },
  { id: 9, date: '30/06/2026', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2606', debit: null, credit: 500.34 },
  { id: 10, date: '30/06/2026', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2606', debit: null, credit: 6.25 },
  { id: 11, date: '30/06/2026', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2606', debit: null, credit: 2.22 },
  { id: 12, date: '30/06/2026', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2606', debit: null, credit: 116.17 },
  { id: 13, date: '30/06/2026', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2606', debit: 82.3, credit: null },
  { id: 14, date: '30/06/2026', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2606', debit: 4988.07, credit: null },
  { id: 15, date: '30/06/2026', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2606', debit: 1364.14, credit: null },
  { id: 16, date: '30/06/2026', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2606', debit: 266.88, credit: null },
  { id: 17, date: '30/06/2026', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2606', debit: 3.49, credit: null },
  { id: 18, date: '31/05/2026', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2605', debit: null, credit: 2990.52 },
  { id: 19, date: '31/05/2026', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2605', debit: null, credit: 1453.91 },
  { id: 20, date: '31/05/2026', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2605', debit: null, credit: 333.32 },
  { id: 21, date: '31/05/2026', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2605', debit: null, credit: 5.23 },
  { id: 22, date: '31/05/2026', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2605', debit: null, credit: 1.5 },
  { id: 23, date: '31/05/2026', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2605', debit: null, credit: 116.17 },
  { id: 24, date: '31/05/2026', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2605', debit: 65.36, credit: null },
  { id: 25, date: '31/05/2026', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2605', debit: 3961.4, credit: null },
  { id: 26, date: '31/05/2026', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2605', debit: 723.21, credit: null },
  { id: 27, date: '31/05/2026', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2605', debit: 147.91, credit: null },
  { id: 28, date: '31/05/2026', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2605', debit: 2.77, credit: null },
  { id: 29, date: '30/04/2026', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2604', debit: null, credit: 2990.52 },
  { id: 30, date: '30/04/2026', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2604', debit: null, credit: 1454.15 },
  { id: 31, date: '30/04/2026', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2604', debit: null, credit: 333.37 },
  { id: 32, date: '30/04/2026', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2604', debit: null, credit: 5.23 },
  { id: 33, date: '30/04/2026', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2604', debit: null, credit: 1.5 },
  { id: 34, date: '30/04/2026', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2604', debit: null, credit: 116.17 },
  { id: 35, date: '30/04/2026', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2604', debit: 65.36, credit: null },
  { id: 36, date: '30/04/2026', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2604', debit: 3961.4, credit: null },
  { id: 37, date: '30/04/2026', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2604', debit: 723.45, credit: null },
  { id: 38, date: '30/04/2026', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2604', debit: 147.96, credit: null },
  { id: 39, date: '30/04/2026', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2604', debit: 2.77, credit: null },
  { id: 40, date: '31/03/2026', journal: 'OD', account: '411001', accountLabel: 'Créance famille LE LÉZEC', label: 'Sans libellé', debit: -485.0, credit: null },
  { id: 41, date: '31/03/2026', journal: 'OD', account: '411003', accountLabel: 'Créance famille RIOBÉ', label: 'Sans libellé', debit: -3420.0, credit: null },
  { id: 42, date: '31/03/2026', journal: 'OD', account: '740001', accountLabel: 'Subvention fonds sociaux', label: 'Sans libellé', debit: null, credit: -3905.0 },
  { id: 43, date: '31/03/2026', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2603', debit: null, credit: 2990.52 },
  { id: 44, date: '31/03/2026', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2603', debit: null, credit: 1454.12 },
  { id: 45, date: '31/03/2026', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2603', debit: null, credit: 333.37 },
  { id: 46, date: '31/03/2026', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2603', debit: null, credit: 5.23 },
  { id: 47, date: '31/03/2026', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2603', debit: null, credit: 1.5 },
  { id: 48, date: '31/03/2026', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2603', debit: null, credit: 116.17 },
  { id: 49, date: '31/03/2026', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2603', debit: 65.36, credit: null },
  { id: 50, date: '31/03/2026', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2603', debit: 3961.4, credit: null },
  { id: 51, date: '31/03/2026', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2603', debit: 723.42, credit: null },
  { id: 52, date: '31/03/2026', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2603', debit: 147.96, credit: null },
  { id: 53, date: '31/03/2026', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2603', debit: 2.77, credit: null },
  { id: 54, date: '28/02/2026', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2602', debit: null, credit: 2961.58 },
  { id: 55, date: '28/02/2026', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2602', debit: null, credit: 1418.93 },
  { id: 56, date: '28/02/2026', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2602', debit: null, credit: 326.36 },
  { id: 57, date: '28/02/2026', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2602', debit: null, credit: 5.19 },
  { id: 58, date: '28/02/2026', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2602', debit: null, credit: 1.48 },
  { id: 59, date: '28/02/2026', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2602', debit: null, credit: 115.31 },
  { id: 60, date: '28/02/2026', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2602', debit: 64.74, credit: null },
  { id: 61, date: '28/02/2026', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2602', debit: 3923.36, credit: null },
  { id: 62, date: '28/02/2026', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2602', debit: 695.25, credit: null },
  { id: 63, date: '28/02/2026', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2602', debit: 142.75, credit: null },
  { id: 64, date: '28/02/2026', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2602', debit: 2.75, credit: null },
  { id: 65, date: '12/02/2026', journal: 'OD', account: '437600', accountLabel: 'AKTO', label: 'REGUL 01/2025 à 12/2025', debit: null, credit: null },
  { id: 66, date: '31/01/2026', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2601', debit: null, credit: 2961.58 },
  { id: 67, date: '31/01/2026', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2601', debit: null, credit: 1418.93 },
  { id: 68, date: '31/01/2026', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2601', debit: null, credit: 326.36 },
  { id: 69, date: '31/01/2026', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2601', debit: null, credit: 5.19 },
  { id: 70, date: '31/01/2026', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2601', debit: null, credit: 1.48 },
  { id: 71, date: '31/01/2026', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2601', debit: null, credit: 115.31 },
  { id: 72, date: '31/01/2026', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2601', debit: 64.74, credit: null },
  { id: 73, date: '31/01/2026', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2601', debit: 3923.36, credit: null },
  { id: 74, date: '31/01/2026', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2601', debit: 695.25, credit: null },
  { id: 75, date: '31/01/2026', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2601', debit: 142.75, credit: null },
  { id: 76, date: '31/01/2026', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2601', debit: 2.75, credit: null },
  { id: 77, date: '31/12/2025', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2512', debit: null, credit: 2961.58 },
  { id: 78, date: '31/12/2025', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2512', debit: null, credit: 1421.15 },
  { id: 79, date: '31/12/2025', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2512', debit: null, credit: 362.56 },
  { id: 80, date: '31/12/2025', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2512', debit: null, credit: 5.19 },
  { id: 81, date: '31/12/2025', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2512', debit: null, credit: 1.48 },
  { id: 82, date: '31/12/2025', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2512', debit: null, credit: 115.31 },
  { id: 83, date: '31/12/2025', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2512', debit: 64.74, credit: null },
  { id: 84, date: '31/12/2025', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2512', debit: 3923.36, credit: null },
  { id: 85, date: '31/12/2025', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2512', debit: 697.47, credit: null },
  { id: 86, date: '31/12/2025', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2512', debit: 178.95, credit: null },
  { id: 87, date: '31/12/2025', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2512', debit: 2.75, credit: null },
  { id: 88, date: '30/11/2025', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2511', debit: null, credit: 2961.58 },
  { id: 89, date: '30/11/2025', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2511', debit: null, credit: 1421.41 },
  { id: 90, date: '30/11/2025', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2511', debit: null, credit: 362.62 },
  { id: 91, date: '30/11/2025', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2511', debit: null, credit: 5.19 },
  { id: 92, date: '30/11/2025', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2511', debit: null, credit: 1.48 },
  { id: 93, date: '30/11/2025', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2511', debit: null, credit: 115.31 },
  { id: 94, date: '30/11/2025', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2511', debit: 64.74, credit: null },
  { id: 95, date: '30/11/2025', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2511', debit: 3923.36, credit: null },
  { id: 96, date: '30/11/2025', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2511', debit: 697.73, credit: null },
  { id: 97, date: '30/11/2025', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2511', debit: 179.01, credit: null },
  { id: 98, date: '30/11/2025', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2511', debit: 2.75, credit: null },
  { id: 99, date: '31/10/2025', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2510', debit: null, credit: 2545.11 },
  { id: 100, date: '31/10/2025', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2510', debit: null, credit: 1181.61 },
  { id: 101, date: '31/10/2025', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2510', debit: null, credit: 302.35 },
  { id: 102, date: '31/10/2025', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2510', debit: null, credit: 4.3 },
  { id: 103, date: '31/10/2025', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2510', debit: null, credit: 1.43 },
  { id: 104, date: '31/10/2025', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2510', debit: null, credit: 95.18 },
  { id: 105, date: '31/10/2025', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2510', debit: 55.56, credit: null },
  { id: 106, date: '31/10/2025', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2510', debit: 3366.67, credit: null },
  { id: 107, date: '31/10/2025', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2510', debit: 560.61, credit: null },
  { id: 108, date: '31/10/2025', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2510', debit: 144.78, credit: null },
  { id: 109, date: '31/10/2025', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2510', debit: 2.36, credit: null },
  { id: 110, date: '30/09/2025', journal: 'PAIE', account: '421100', accountLabel: 'Rémunérations dues', label: 'Paie2509', debit: null, credit: 3367.28 },
  { id: 111, date: '30/09/2025', journal: 'PAIE', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'Paie2509', debit: null, credit: 1638.47 },
  { id: 112, date: '30/09/2025', journal: 'PAIE', account: '437300', accountLabel: 'HUMANIS PREVOYANCE', label: 'Paie2509', debit: null, credit: 416.99 },
  { id: 113, date: '30/09/2025', journal: 'PAIE', account: '437600', accountLabel: 'AKTO', label: 'Paie2509', debit: null, credit: 6.0 },
  { id: 114, date: '30/09/2025', journal: 'PAIE', account: '437700', accountLabel: 'Paritarisme', label: 'Paie2509', debit: null, credit: 1.48 },
  { id: 115, date: '30/09/2025', journal: 'PAIE', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'Paie2509', debit: null, credit: 85.62 },
  { id: 116, date: '30/09/2025', journal: 'PAIE', account: '633300', accountLabel: 'Formation', label: 'Paie2509', debit: 72.65, credit: null },
  { id: 117, date: '30/09/2025', journal: 'PAIE', account: '641100', accountLabel: 'Salaire de base', label: 'Paie2509', debit: 4402.81, credit: null },
  { id: 118, date: '30/09/2025', journal: 'PAIE', account: '645100', accountLabel: 'Sécurité sociale', label: 'Paie2509', debit: 826.36, credit: null },
  { id: 119, date: '30/09/2025', journal: 'PAIE', account: '645300', accountLabel: 'Prévoyance 1', label: 'Paie2509', debit: 210.94, credit: null },
  { id: 120, date: '30/09/2025', journal: 'PAIE', account: '645350', accountLabel: 'Paritarisme 1', label: 'Paie2509', debit: 3.08, credit: null },
  { id: 121, date: '01/09/2025', journal: 'OD', account: '487000', accountLabel: 'Produit perçu d\'avance', label: 'Famille BEZIAT MENUT Rentrée 2025', debit: 50.0, credit: null },
  { id: 122, date: '01/09/2025', journal: 'OD', account: '706002', accountLabel: 'Frais d\'inscription', label: 'Famille BEZIAT MENUT Rentrée 2025', debit: null, credit: 50.0 },
  { id: 123, date: '01/09/2025', journal: 'OD', account: '411002', accountLabel: 'Créance famille PASTRE', label: 'Chèque non signé 2024/2025', debit: -303.0, credit: null },
  { id: 124, date: '01/09/2025', journal: 'OD', account: '707201', accountLabel: 'Ventes divers', label: 'Fromages 2024/2025', debit: null, credit: -303.0 },
  { id: 125, date: '31/08/2025', journal: 'OD', account: '411002', accountLabel: 'Créance famille PASTRE', label: 'Chèque non signé', debit: 303.0, credit: null },
  { id: 126, date: '31/08/2025', journal: 'OD', account: '707200', accountLabel: 'Ventes divers', label: 'Fromages', debit: null, credit: 303.0 },
  { id: 127, date: '31/08/2025', journal: 'OD', account: '431100', accountLabel: 'URSSAF RHONE-ALPES', label: 'REGUL 09/2023 à 08/2025', debit: 7.25, credit: null },
  { id: 128, date: '31/08/2025', journal: 'OD', account: '778000', accountLabel: 'Autres produits exceptionnels', label: 'REGUL 09/2023 à 08/2025', debit: null, credit: 7.25 },
  { id: 129, date: '31/08/2025', journal: 'OD', account: '487000', accountLabel: 'Produit perçu d\'avance', label: 'Famille BEZIAT MENUT Rentrée 2025', debit: -50.0, credit: null },
  { id: 130, date: '31/08/2025', journal: 'OD', account: '706002', accountLabel: 'Frais d\'inscription', label: 'Famille BEZIAT MENUT Rentrée 2025', debit: null, credit: -50.0 },
  { id: 131, date: '31/08/2025', journal: 'OD', account: '437600', accountLabel: 'AKTO', label: 'REGUL 09/2023 à 12/2024', debit: 0.03, credit: null },
  { id: 132, date: '31/08/2025', journal: 'OD', account: '778000', accountLabel: 'Autres produits exceptionnels', label: 'REGUL 09/2023 à 12/2024', debit: null, credit: 0.03 },
  { id: 133, date: '31/08/2025', journal: 'OD', account: '442100', accountLabel: 'Etat - Prélèvement à la sour', label: 'REGUL 09/2023 à 08/2025', debit: 1.41, credit: null },
  { id: 134, date: '31/08/2025', journal: 'OD', account: '778000', accountLabel: 'Autres produits exceptionnels', label: 'REGUL 09/2023 à 08/2025', debit: null, credit: 1.41 },
  { id: 135, date: '31/08/2025', journal: 'OD', account: '411001', accountLabel: 'Créance famille LE LÉZEC', label: 'Solde restant', debit: 60.0, credit: null },
  { id: 136, date: '31/08/2025', journal: 'OD', account: '411001', accountLabel: 'Créance famille LE LÉZEC', label: 'Fondation Kairos Versement 12/2025', debit: 425.0, credit: null },
  { id: 137, date: '31/08/2025', journal: 'OD', account: '411003', accountLabel: 'Créance famille RIOBÉ', label: 'Solde restant', debit: 76.95, credit: null },
  { id: 138, date: '31/08/2025', journal: 'OD', account: '411003', accountLabel: 'Créance famille RIOBÉ', label: 'Fondation Kairos Versement 12/2025', debit: 3343.05, credit: null },
  { id: 139, date: '31/08/2025', journal: 'OD', account: '706001', accountLabel: 'Frais de scolarité', label: 'Année 2024/2025', debit: null, credit: 3905.0 },
  { id: 140, date: '31/08/2025', journal: 'OD', account: '421100', accountLabel: 'Rémunérations dues', label: 'REGUL 09/2023 à 07/2025', debit: -0.04, credit: null },
  { id: 141, date: '31/08/2025', journal: 'OD', account: '778000', accountLabel: 'Autres produits exceptionnels', label: 'REGUL 09/2023 à 07/2025', debit: null, credit: -0.04 }
];

const initialFamilies = [
  { id: 1, name: 'Famille LÉZEC', children: 1, balance: -485 },
  { id: 2, name: 'Famille PASTRE', children: 1, balance: 0 }, 
  { id: 3, name: 'Famille RIOBÉ', children: 2, balance: -3420 },
];

const initialParents = [
  { id: 1, name: 'Famille PASTRE', year: '2025/2026', status: 'À jour', phone: '06 12 34 56 78', email: 'pastre@exemple.com' },
  { id: 2, name: 'Famille RIOBÉ', year: '2025/2026', status: 'Dossier incomplet', phone: '06 98 76 54 32', email: 'riobe@exemple.com' },
  { id: 3, name: 'Famille LÉZEC', year: '2024/2025', status: 'Ancien élève', phone: '06 11 22 33 44', email: 'lezec@exemple.com' },
];

const initialPeriscolaire = [
  { id: 1, childName: 'Léo PASTRE', class: 'CE1', days: 'Lundi, Jeudi', cost: 120, paid: 120 },
  { id: 2, childName: 'Mia RIOBÉ', class: 'CM2', days: 'Tous les jours', cost: 450, paid: 200 },
];

const financialStatements = {
  '2025/2026': {
    bilanActif: [
      { id: '275100', name: 'Dépôts Garantie', amount: 1150.00 },
      { id: '411000', name: 'Créance clients KAIROS', amount: 2653.70 },
      { id: '512000', name: 'Banque', amount: 29040.74 } 
    ],
    bilanPassif: [
      { id: '110000', name: 'Report à nouveau (N-1)', amount: 17904.53 },
      { id: '120000', name: 'Résultat de l\'exercice', amount: 14291.38, isResult: true },
      { id: '431100', name: 'URSSAF RHONE-ALPES', amount: 0.00 }, 
      { id: '437300', name: 'B2V (Caisse de retraite)', amount: 606.54 },
      { id: '437600', name: 'AKTO', amount: 32.31 },
      { id: '437700', name: 'Paritarisme', amount: 9.68 },
      { id: '442100', name: 'Etat - Prélèvement à la source', amount: 0.00 },
    ],
    resultat: [
      { id: 'PRODUITS', name: 'TOTAL PRODUITS (Recettes)', amount: 86791.52, type: 'header' }, 
      { id: '706001', name: 'Frais de scolarité', amount: 23090.30, type: 'item' },
      { id: '706002', name: 'Frais d\'inscription', amount: 250.00, type: 'item' },
      { id: '706003', name: 'Frais fournitures scolaire', amount: 720.00, type: 'item' },
      { id: '740000', name: 'Subvention fonds sociaux', amount: 2653.70, type: 'item' },
      { id: '740001', name: 'Subvention fonds sociaux', amount: 1095.00, type: 'item' },
      { id: '754000', name: 'Dons & Mécénat', amount: 54865.00, type: 'item' }, 
      { id: '778000', name: 'Autres produits exceptionnels', amount: 4117.52, type: 'item' },
      { id: 'CHARGES', name: 'TOTAL CHARGES (Dépenses)', amount: -72500.14, type: 'header' }, 
      { id: '606100', name: 'Energie', amount: -3019.08, type: 'item' }, 
      { id: '606400', name: 'Consommables', amount: -718.11, type: 'item' },
      { id: '606800', name: 'Achat fromages', amount: -1976.78, type: 'item' },
      { id: '613200', name: 'Loyer', amount: -12884.54, type: 'item' }, 
      { id: '615000', name: 'Entretiens et réparations', amount: -271.63, type: 'item' },
      { id: '616800', name: 'Assurance', amount: -838.36, type: 'item' },
      { id: '621000', name: 'Prestation externe', amount: -1264.19, type: 'item' },
      { id: '627100', name: 'Services bancaire', amount: -87.60, type: 'item' },
      { id: '633300', name: 'Formation', amount: -665.55, type: 'item' },
      { id: '641100', name: 'Salaire de base', amount: -40335.19, type: 'item' },
      { id: '645100', name: 'Sécurité sociale', amount: -7706.89, type: 'item' },
      { id: '645300', name: 'Retraite ARRCO', amount: -1709.89, type: 'item' },
      { id: '645350', name: 'Paritarisme 1', amount: -28.24, type: 'item' },
      { id: '647500', name: 'Médecine de travail', amount: -468.00, type: 'item' },
      { id: 'RESULTAT', name: 'RÉSULTAT NET', amount: 14291.38, type: 'total' }
    ]
  },
  '2024/2025': {
    bilanActif: [{ id: '512000', name: 'Banque', amount: 14001.39 }],
    bilanPassif: [{ id: '120000', name: 'Résultat de l\'exercice', amount: -996.90, isResult: true }],
    resultat: [{ id: 'RESULTAT', name: 'RÉSULTAT NET', amount: -996.90, type: 'total' }]
  },
  '2023/2024': {
    bilanActif: [{ id: '512000', name: 'Banque', amount: 18957.37 }],
    bilanPassif: [{ id: '120000', name: 'Résultat de l\'exercice', amount: -1058.97, isResult: true }],
    resultat: [{ id: 'RESULTAT', name: 'RÉSULTAT NET', amount: -1058.97, type: 'total' }]
  },
  '2022/2023': {
    bilanActif: [{ id: '512000', name: 'Banque', amount: 18810.00 }],
    bilanPassif: [{ id: '120000', name: 'Résultat de l\'exercice', amount: 19568.00, isResult: true }],
    resultat: [{ id: 'RESULTAT', name: 'RÉSULTAT NET', amount: 19568.00, type: 'total' }]
  },
  '2021/2022': {
    bilanActif: [{ id: '512000', name: 'Banque', amount: 393.00 }],
    bilanPassif: [{ id: '120000', name: 'Résultat de l\'exercice', amount: 393.00, isResult: true }],
    resultat: [{ id: 'RESULTAT', name: 'RÉSULTAT NET', amount: 393.00, type: 'total' }]
  }
};

const chartDataYearly = [
  { year: '21/22', Recettes: 428, Dépenses: 35 },
  { year: '22/23', Recettes: 29295, Dépenses: 9727 },
  { year: '23/24', Recettes: 62977, Dépenses: 64036 },
  { year: '24/25', Recettes: 57438, Dépenses: 58435 },
  { year: '25/26', Recettes: 86792, Dépenses: 72500 }, 
];

const chartDataTreasury = [
  { year: '21/22', Solde: 393 },
  { year: '22/23', Solde: 18810 },
  { year: '23/24', Solde: 18957 },
  { year: '24/25', Solde: 14001 },
  { year: '25/26', Solde: 29041 }, 
];

const chartDataIncome2526 = [
  { name: 'Dons & Mécénat', value: 54865 }, 
  { name: 'Scolarité & Inscriptions', value: 24060 }, 
  { name: 'Subventions', value: 3749 }, 
  { name: 'Ventes & Divers', value: 4118 }, 
];

const chartDataExpenses2526 = [
  { name: 'Frais de Personnel', value: 50248 },
  { name: 'Locaux & Énergie', value: 17014 },
  { name: 'Achats & Fournitures', value: 2968 },
  { name: 'Frais divers & Banque', value: 2270 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(initialTransactions);
  const [families, setFamilies] = useState(initialFamilies);
  const [parents, setParents] = useState(initialParents);
  const [periscolaire, setPeriscolaire] = useState(initialPeriscolaire);
  const [selectedYear, setSelectedYear] = useState('2025/2026');
  const [toast, setToast] = useState(null);

  const [donors, setDonors] = useState([
    { id: 1, name: 'Famille ESPÉRANCE', email: 'famille.esperance@exemple.com', totalDonated: 20000.00, lastDonationDate: '21/07/2026' },
    { id: 2, name: 'Dons Anonymes & Divers', email: 'non-renseigne@exemple.com', totalDonated: 34865.00, lastDonationDate: '14/07/2026' },
    { id: 3, name: 'SARL C-MAT', email: 'contact@c-mat.exemple.com', totalDonated: 973.14, lastDonationDate: '05/06/2025' },
    { id: 4, name: 'FAUVAIN Luc', email: 'luc.fauvain@exemple.com', totalDonated: 1049.43, lastDonationDate: '29/08/2025' },
    { id: 5, name: 'FAUVAIN Marie-Pia', email: 'mp.fauvain@exemple.com', totalDonated: 118.96, lastDonationDate: '08/04/2024' },
    { id: 6, name: 'TAISSIDRE David', email: 'david.taissidre@exemple.com', totalDonated: 30.58, lastDonationDate: '23/09/2025' },
    { id: 7, name: 'BÉZIAT-MENUT Louis', email: 'louis.beziat@exemple.com', totalDonated: 240.64, lastDonationDate: '07/10/2025' },
    { id: 8, name: 'GADIOLET Bénédicte', email: 'b.gadiolet@exemple.com', totalDonated: 15.25, lastDonationDate: '27/04/2026' },
  ]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '';
    return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  };

  const totalDons2526 = donors.reduce((sum, d) => sum + d.totalDonated, 0);
  const totalIncome2526 = chartDataIncome2526.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses2526 = chartDataExpenses2526.reduce((sum, item) => sum + item.value, 0);

  const DashboardModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          Tableau de bord - Mon Ecole en Dauphiné
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200 font-medium">
            <Presentation size={18} /> Mode Présentation AG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 flex flex-col justify-center" style={{borderLeftColor: THEME_COLOR}}>
          <h3 className="text-gray-500 text-sm font-medium">Trésorerie Actuelle</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">29 040,74 €</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Dons Récoltés <span className="text-xs font-normal">(25/26)</span></h3>
          <p className="text-2xl font-bold text-gray-800 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{formatCurrency(totalDons2526)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Créances Familles</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">3 905,00 €</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500 flex flex-col justify-center">
          <h3 className="text-gray-500 text-sm font-medium">Résultat 25/26</h3>
          <p className="text-2xl font-bold text-green-600 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">+14 291,38 €</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 justify-center" style={{color: THEME_COLOR}}>
            <HeartHandshake size={20} /> Répartition des Recettes
          </h3>
          <p className="text-2xl font-bold text-slate-800 mb-6">{formatCurrency(totalIncome2526)}</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataIncome2526}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                  label={renderCustomizedLabel} labelLine={false}
                >
                  {chartDataIncome2526.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-red-500 mb-2 flex items-center gap-2 justify-center">
            <PieChartIcon size={20} /> Répartition des Dépenses
          </h3>
          <p className="text-2xl font-bold text-slate-800 mb-6">{formatCurrency(totalExpenses2526)}</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartDataExpenses2526}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                  label={renderCustomizedLabel} labelLine={false}
                >
                  {chartDataExpenses2526.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 justify-center" style={{color: THEME_COLOR}}>
            <BarChart3 size={20} /> Évolution Recettes / Dépenses
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataYearly} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)} k€`} />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Recettes" fill={THEME_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 justify-center" style={{color: THEME_COLOR}}>
            <TrendingUp size={20} /> Évolution de la Trésorerie
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartDataTreasury} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)} k€`} />
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line name="Solde Bancaire" type="monotone" dataKey="Solde" stroke={THEME_COLOR} strokeWidth={3} dot={{ r: 4, fill: THEME_COLOR, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const AccountingModule = () => {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    const requestSort = (key) => {
      let direction = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };

    const sortedTransactions = useMemo(() => {
      let sortableItems = [...transactions];
      if (sortConfig !== null) {
        sortableItems.sort((a, b) => {
          let aValue = a[sortConfig.key];
          let bValue = b[sortConfig.key];

          if (sortConfig.key === 'date') {
            const dateA = aValue ? aValue.split('/').reverse().join('') : '';
            const dateB = bValue ? bValue.split('/').reverse().join('') : '';
            aValue = dateA;
            bValue = dateB;
          } else if (sortConfig.key === 'debit' || sortConfig.key === 'credit') {
            aValue = aValue || 0;
            bValue = bValue || 0;
          } else {
            aValue = aValue ? aValue.toString().toLowerCase() : '';
            bValue = bValue ? bValue.toString().toLowerCase() : '';
          }

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return sortableItems;
    }, [transactions, sortConfig]);

    const totalDebit = sortedTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredit = sortedTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);

    const SortableHeader = ({ label, columnKey, align = 'left' }) => (
      <th 
        className={`p-4 font-semibold text-gray-600 text-sm cursor-pointer select-none group hover:bg-gray-200 transition-colors ${align === 'right' ? 'text-right' : 'text-left'}`}
        onClick={() => requestSort(columnKey)}
        title={`Trier par ${label}`}
      >
        <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
          {label}
          {sortConfig.key === columnKey ? (
            sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{color: THEME_COLOR}} /> : <ChevronDown size={14} style={{color: THEME_COLOR}} />
          ) : (
            <ChevronsUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </th>
    );

    return (
      <div className="space-y-4 h-full flex flex-col pb-8">
        <div className="flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Journal de Banque & OD</h2>
            <p className="text-gray-500 text-sm mt-1">
              Affichage de l'intégralité des <strong>{transactions.length} écritures</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={18} /> Exporter
            </button>
            <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors shadow-sm" style={{backgroundColor: THEME_COLOR}}>
              <Plus size={18} /> Nouvelle Écriture
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col flex-1" style={{ minHeight: 0 }}>
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
                <tr className="border-b border-gray-200">
                  <SortableHeader label="Date" columnKey="date" />
                  <SortableHeader label="Journal" columnKey="journal" />
                  <SortableHeader label="Compte" columnKey="account" />
                  <SortableHeader label="Libellé Pièce" columnKey="label" />
                  <SortableHeader label="Débit" columnKey="debit" align="right" />
                  <SortableHeader label="Crédit" columnKey="credit" align="right" />
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                    <td className="p-4 text-sm text-gray-800 whitespace-nowrap">{t.date}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide ${
                        t.journal === 'PAIE' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 
                        t.journal === 'OD' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {t.journal}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-mono text-gray-800 font-medium">{t.account}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]" title={t.accountLabel}>{t.accountLabel}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-800">{t.label}</td>
                    <td className="p-4 text-sm text-right font-medium text-gray-700">
                      {t.debit !== null ? formatCurrency(t.debit) : ''}
                    </td>
                    <td className="p-4 text-sm text-right font-medium text-gray-700">
                      {t.credit !== null ? formatCurrency(t.credit) : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t-2 border-gray-200 shadow-[0_-2px_4px_rgba(0,0,0,0.05)] p-4 flex justify-between shrink-0">
             <div className="font-bold text-gray-700 uppercase text-xs tracking-wider pt-1">Total des écritures affichées</div>
             <div className="flex gap-8 text-right">
                <div className="font-bold text-gray-900 w-24">{formatCurrency(totalDebit)}</div>
                <div className="font-bold text-gray-900 w-24">{formatCurrency(totalCredit)}</div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const BillingModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Familles & Facturation</h2>
        <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors shadow-sm" style={{backgroundColor: THEME_COLOR}}>
          <Plus size={18} /> Générer Factures
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {families.map(f => (
          <div key={f.id} className={`bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center ${f.balance === 0 ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                {f.name}
                {f.balance === 0 && <CheckCircle size={16} className="text-green-500" />}
              </h3>
              <p className="text-sm text-gray-500">{f.children} enfant(s) scolarisé(s)</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-sm text-gray-500 mb-1">Solde à régler</p>
              <p className={`text-xl font-bold ${f.balance === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(f.balance)} €
              </p>
              {f.balance !== 0 && (
                <button className="text-sm hover:underline mt-2" style={{color: THEME_COLOR}}>Envoyer rappel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ExpensesModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Notes de Frais & Abandons</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-start gap-3">
          <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900">Abandons de frais validés et intégrés en compta (Comptes 6 + 754)</h4>
            <p className="text-sm text-blue-800 mt-1">Ces montants ont généré un reçu fiscal pour le bénévole.</p>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600 text-sm">Bénévole / Société</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Dernière note</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Description type</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total Abandonné</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'SARL C-MAT', date: '05/06/2025', desc: 'Matériel travaux & Assurance', amount: 973.14 },
              { name: 'FAUVAIN Luc', date: '29/08/2025', desc: 'Petit matériel, Yesss élec...', amount: 1049.43 },
              { name: 'FAUVAIN Marie-Pia', date: '08/04/2024', desc: 'Support communication', amount: 118.96 },
              { name: 'TAISSIDRE David', date: '23/09/2025', desc: 'Boîte à clés sécurisée', amount: 30.58 },
              { name: 'BÉZIAT-MENUT Louis', date: '07/10/2025', desc: 'Travaux élec & plomberie', amount: 240.64 },
              { name: 'GADIOLET Bénédicte', date: '27/04/2026', desc: 'Livres et manuels scolaires', amount: 15.25 }
            ].map((frais, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{frais.name}</td>
                <td className="p-4 text-sm text-gray-600">{frais.date}</td>
                <td className="p-4 text-sm text-gray-600">{frais.desc}</td>
                <td className="p-4 text-sm text-right font-bold text-green-600">{formatCurrency(frais.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const DonorsModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <h2 className="text-2xl font-bold text-gray-800">Dons, Mécénat & Reçus Fiscaux</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600 text-sm">Donateur / Mécène</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Dernier Don</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total (Année)</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map(d => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-semibold text-gray-800">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.email}</p>
                </td>
                <td className="p-4 text-sm text-gray-600">{d.lastDonationDate}</td>
                <td className="p-4 text-sm text-right font-medium text-green-600">{formatCurrency(d.totalDonated)}</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => showToast(`Reçu fiscal généré pour ${d.name}`)}
                      className="p-2 rounded transition-colors" 
                      style={{color: THEME_COLOR, backgroundColor: THEME_COLOR_LIGHT}}
                      title="Générer Cerfa"
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const FinancialStatementsModule = () => {
    const data = financialStatements[selectedYear] || { bilanActif: [], bilanPassif: [], resultat: [] };
    const totalActif = data.bilanActif.reduce((sum, item) => sum + item.amount, 0);
    const totalPassif = data.bilanPassif.reduce((sum, item) => sum + item.amount, 0);

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">États Financiers Annuels</h2>
            <p className="text-gray-500 text-sm mt-1">Clôture des exercices et édition de la liasse fiscale</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm">
            <Calendar size={18} className="text-gray-500" />
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-gray-900 font-medium text-sm focus:outline-none cursor-pointer"
            >
              <option value="2025/2026">Exercice 2025/2026</option>
              <option value="2024/2025">Exercice 2024/2025</option>
              <option value="2023/2024">Exercice 2023/2024</option>
              <option value="2022/2023">Exercice 2022/2023</option>
              <option value="2021/2022">Exercice 2021/2022</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <PieChartIcon size={20} style={{color: THEME_COLOR}} /> Compte de Résultat
            </h3>
          </div>
          <div className="p-0">
            <table className="w-full text-left border-collapse">
              <tbody>
                {data.resultat.map((item, index) => (
                  <tr key={index} className={`
                    border-b border-gray-100 
                    ${item.type === 'header' ? 'bg-gray-50 font-bold text-gray-700' : ''}
                    ${item.type === 'total' ? 'bg-gray-800 text-white font-bold' : ''}
                    ${item.type === 'item' ? 'hover:bg-gray-50' : ''}
                  `}>
                    <td className="p-3 text-sm">
                      {item.type === 'item' && <span className="font-mono text-gray-500 mr-3 text-xs">{item.id}</span>}
                      {item.name}
                    </td>
                    <td className={`p-3 text-sm text-right ${item.type === 'total' ? 'text-white' : ''} ${item.amount < 0 && item.type !== 'total' ? 'text-red-500' : ''}`}>
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg">Bilan - Actif</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {data.bilanActif.map((item, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-sm">
                        <span className="font-mono text-gray-500 mr-2 text-xs">{item.id}</span>
                        {item.name}
                      </td>
                      <td className="py-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between p-4 rounded-lg text-white font-bold mt-4 shadow-sm" style={{backgroundColor: THEME_COLOR}}>
                <span>TOTAL ACTIF</span>
                <span>{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800 text-lg">Bilan - Passif</h3>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {data.bilanPassif.map((item, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 text-sm flex items-center gap-2">
                        <span className="font-mono text-gray-500 text-xs">{item.id}</span>
                        {item.name}
                        {item.isResult && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold">CALCULÉ</span>}
                      </td>
                      <td className="py-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between p-4 rounded-lg text-white font-bold mt-4 shadow-sm" style={{backgroundColor: THEME_COLOR}}>
                <span>TOTAL PASSIF</span>
                <span>{formatCurrency(totalPassif)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ParentsModule = () => {
    const [filterYear, setFilterYear] = useState('2025/2026');
    const filteredParents = parents.filter(p => p.year === filterYear);

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Suivi des Parents par Année</h2>
            <p className="text-gray-500 text-sm mt-1">Gestion administrative des dossiers d'inscription</p>
          </div>
          <div className="flex gap-2">
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg shadow-sm focus:outline-none"
            >
              <option value="2026/2027">Année 2026/2027</option>
              <option value="2025/2026">Année 2025/2026</option>
              <option value="2024/2025">Année 2024/2025</option>
            </select>
            <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors shadow-sm" style={{backgroundColor: THEME_COLOR}}>
              <Plus size={18} /> Nouvelle Famille
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Famille</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Contact</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Statut Dossier</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.map(p => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{p.name}</td>
                  <td className="p-4 text-sm text-gray-600">
                    <div>{p.phone}</div>
                    <div className="text-gray-400">{p.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold tracking-wide ${
                      p.status === 'À jour' ? 'bg-green-100 text-green-800' : 
                      p.status === 'Dossier incomplet' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="text-blue-600 hover:underline text-sm font-medium">Modifier</button>
                  </td>
                </tr>
              ))}
              {filteredParents.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500">Aucune famille trouvée pour cette année scolaire.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const PeriscolaireModule = () => (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Suivi Périscolaire 2027/2028</h2>
          <p className="text-gray-500 text-sm mt-1">Prévisions Cantine & Garderie pour la rentrée 2027</p>
        </div>
        <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors shadow-sm" style={{backgroundColor: THEME_COLOR}}>
          <Plus size={18} /> Ajouter Enfant
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-600 text-sm">Élève</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Classe prévue</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Jours de garde</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Coût estimé</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Acomptes versés</th>
            </tr>
          </thead>
          <tbody>
            {periscolaire.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{p.childName}</td>
                <td className="p-4 text-sm text-gray-600">{p.class}</td>
                <td className="p-4 text-sm text-gray-600">{p.days}</td>
                <td className="p-4 text-sm text-right font-medium">{formatCurrency(p.cost)}</td>
                <td className="p-4 text-sm text-right font-bold text-green-600">{formatCurrency(p.paid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <aside className="w-64 bg-white text-slate-800 flex flex-col shrink-0 border-r border-gray-200">
        <div className="p-6 border-b border-gray-100 flex flex-col items-center text-center bg-white">
          <img 
            src="bleu fond blanc-2_2.png" 
            alt="Logo Cours Tom Morel" 
            className="w-40 h-auto mb-6 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/150x80?text=Logo+Tom+Morel';
            }}
          />
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord / AG' },
            { id: 'accounting', icon: CreditCard, label: 'Journal & OD' },
            { id: 'billing', icon: Users, label: 'Familles & Factures' },
            { id: 'parents', icon: UserCheck, label: 'Suivi Parents' },
            { id: 'periscolaire', icon: Clock, label: 'Périscolaire 27/28' },
            { id: 'expenses', icon: Receipt, label: 'Notes de frais' },
            { id: 'donors', icon: HeartHandshake, label: 'Dons & Mécénat' },
            { id: 'statements', icon: PieChartIcon, label: 'États Financiers' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              style={activeTab === item.id ? {backgroundColor: THEME_COLOR} : {}}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 h-full flex flex-col overflow-hidden relative">
        <div className="h-full w-full overflow-y-auto p-8">
            {activeTab === 'dashboard' && <DashboardModule />}
            {activeTab === 'accounting' && <AccountingModule />}
            {activeTab === 'billing' && <BillingModule />}
            {activeTab === 'parents' && <ParentsModule />}
            {activeTab === 'periscolaire' && <PeriscolaireModule />}
            {activeTab === 'expenses' && <ExpensesModule />}
            {activeTab === 'donors' && <DonorsModule />}
            {activeTab === 'statements' && <FinancialStatementsModule />}
        </div>
      </main>

      {toast && (
        <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-xl animate-in slide-in-from-bottom-5 z-50">
          <CheckCircle className="text-green-400" size={20} />
          <span className="font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
