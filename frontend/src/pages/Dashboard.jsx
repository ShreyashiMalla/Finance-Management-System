import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line,
} from 'recharts';

const CHART_STYLE = {
  contentStyle: { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff' },
  gridStroke: 'rgba(255,255,255,0.08)',
  tickFill: 'rgba(255,255,255,0.6)',
};

const CATEGORY_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981',
  '#3b82f6','#ef4444','#14b8a6','#f97316','#84cc16',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [txs, setTxs] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [insights, setInsights] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [form, setForm] = useState({
    type: 'INCOME', category: '', amount: '', note: '',
    date: new Date().toISOString().slice(0, 10)
  });

  const load = async () => {
    const [a, b, c, d] = await Promise.all([
      api.get('/transactions'),
      api.get('/transactions/summary'),
      api.get('/transactions/insights'),
      api.get('/transactions/chart-data'),
    ]);
    setTxs(a.data);
    setSummary(b.data);
    setInsights(c.data);
    setChartData(d.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.post('/transactions', { ...form, amount: parseFloat(form.amount) });
    setForm({ ...form, category: '', amount: '', note: '' });
    load();
  };
  const del = async id => { await api.delete(`/transactions/${id}`); load(); };

  const pieData = [
    { name: 'Income', value: Number(summary.totalIncome) },
    { name: 'Expense', value: Number(summary.totalExpense) },
  ];
  const PIE_COLORS = ['#22c55e', '#ef4444'];

  const barData = insights ? [
    { month: 'Last Month', expense: Number(insights.lastMonthExpense) },
    { month: 'This Month', expense: Number(insights.thisMonthExpense) },
  ] : [];

  const trendColor = insights?.spendingTrend === 'up' ? 'text-red-400' : insights?.spendingTrend === 'down' ? 'text-green-400' : 'text-yellow-400';
  const trendIcon = insights?.spendingTrend === 'up' ? '↑' : insights?.spendingTrend === 'down' ? '↓' : '→';
  const trendLabel = insights?.spendingTrend === 'up'
    ? `Spending increased by ${Math.abs(insights.spendingChangePercent)}% from last month`
    : insights?.spendingTrend === 'down'
    ? `Spending decreased by ${Math.abs(insights.spendingChangePercent)}% from last month`
    : 'Spending is stable compared to last month';
  const savings = insights ? Number(insights.thisMonthSavings) : 0;
  const savingsPositive = savings >= 0;
  const monthName = new Date().toLocaleString('default', { month: 'long' });

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={CHART_STYLE.contentStyle} className="p-3 text-sm">
          <p className="font-semibold mb-1 opacity-80">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>{p.name}: ${Number(p.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom label for pie slices
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent < 0.04) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          ['Income', summary.totalIncome, 'from-green-500 to-emerald-500'],
          ['Expense', summary.totalExpense, 'from-red-500 to-rose-500'],
          ['Balance', summary.balance, 'from-indigo-500 to-purple-500'],
        ].map(([l, v, c]) => (
          <div key={l} className={`p-6 rounded-2xl bg-gradient-to-br ${c} shadow-lg`}>
            <p className="text-sm opacity-80">{l}</p>
            <p className="text-3xl font-bold">${Number(v).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Insights Banner */}
      {insights && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${savingsPositive ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="text-4xl">{savingsPositive ? '🎉' : '⚠️'}</div>
            <div>
              <p className="text-sm opacity-70">This month you {savingsPositive ? 'saved' : 'overspent'}</p>
              <p className={`text-2xl font-bold ${savingsPositive ? 'text-green-400' : 'text-red-400'}`}>
                ${Math.abs(savings).toFixed(2)}
              </p>
              <p className="text-xs opacity-60">{savingsPositive ? `Great job, ${user?.name?.split(' ')[0] || 'you'}! Keep it up.` : 'Try to reduce expenses next month.'}</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border bg-white/5 border-white/10 flex items-center gap-4">
            <div className={`text-4xl font-bold ${trendColor}`}>{trendIcon}</div>
            <div>
              <p className="text-sm opacity-70">Spending Trend</p>
              <p className={`text-lg font-semibold ${trendColor}`}>{trendLabel}</p>
              <p className="text-xs opacity-60">{monthName} vs last month</p>
            </div>
          </div>
        </div>
      )}

      {/* This Month Breakdown */}
      {insights && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['This Month Income', insights.thisMonthIncome, 'text-green-400', '💰'],
            ['This Month Expense', insights.thisMonthExpense, 'text-red-400', '💸'],
            ['This Month Savings', insights.thisMonthSavings, savingsPositive ? 'text-green-400' : 'text-red-400', '🏦'],
          ].map(([label, value, color, icon]) => (
            <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-xs opacity-60">{label}</p>
                <p className={`text-xl font-bold ${color}`}>${Number(value).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Transaction + Pie Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={submit} className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl space-y-3">
          <h3 className="text-xl font-bold">Add Transaction</h3>
          <select className="w-full p-2 rounded bg-white/10 border border-white/10" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
          <input required className="w-full p-2 rounded bg-white/10 border border-white/10" placeholder="Category (Food, Salary...)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input required type="number" step="0.01" className="w-full p-2 rounded bg-white/10 border border-white/10" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <input type="date" className="w-full p-2 rounded bg-white/10 border border-white/10" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <input className="w-full p-2 rounded bg-white/10 border border-white/10" placeholder="Note (optional)" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <button className="w-full py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-500 font-semibold">Add</button>
        </form>

        <div className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-xl font-bold mb-2">Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} labelLine={false} label={renderCustomLabel}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} contentStyle={CHART_STYLE.contentStyle} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month-over-Month Bar Chart */}
      {insights && (
        <div className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-xl font-bold mb-1">Month-over-Month Spending</h3>
          <p className="text-sm opacity-50 mb-4">Comparing last month vs current month expenses</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.gridStroke} />
              <XAxis dataKey="month" tick={{ fill: CHART_STYLE.tickFill, fontSize: 12 }} />
              <YAxis tick={{ fill: CHART_STYLE.tickFill, fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${Number(v).toFixed(2)}`, 'Expense']} contentStyle={CHART_STYLE.contentStyle} />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── NEW: Income vs Expense Line Chart (6 months) ── */}
      {chartData && chartData.monthlyTrend && (
        <div className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
          <h3 className="text-xl font-bold mb-1">Income vs Expense — Last 6 Months</h3>
          <p className="text-sm opacity-50 mb-4">Track how your income and spending have changed over time</p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData.monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.gridStroke} />
              <XAxis dataKey="month" tick={{ fill: CHART_STYLE.tickFill, fontSize: 12 }} />
              <YAxis tick={{ fill: CHART_STYLE.tickFill, fontSize: 12 }} tickFormatter={v => `$${v}`} />
              <Tooltip content={<LineTooltip />} />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }} />
              <Line
                type="monotone" dataKey="income" name="Income"
                stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: '#22c55e' }} activeDot={{ r: 6 }}
              />
              <Line
                type="monotone" dataKey="expense" name="Expense"
                stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── NEW: Category-wise Breakdown ── */}
      {chartData && (chartData.expenseByCategory?.length > 0 || chartData.incomeByCategory?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-6">

          {/* Expense by Category */}
          {chartData.expenseByCategory?.length > 0 && (
            <div className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-bold mb-1">Expense by Category</h3>
              <p className="text-sm opacity-50 mb-4">Where your money is going</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.expenseByCategory}
                    dataKey="amount" nameKey="category"
                    outerRadius={85} innerRadius={40}
                    labelLine={false} label={renderCustomLabel}
                  >
                    {chartData.expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} contentStyle={CHART_STYLE.contentStyle} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Category list */}
              <div className="mt-3 space-y-2">
                {chartData.expenseByCategory.slice(0, 5).map((c, i) => {
                  const total = chartData.expenseByCategory.reduce((s, x) => s + Number(x.amount), 0);
                  const pct = total > 0 ? ((Number(c.amount) / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={c.category} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span className="text-sm flex-1 opacity-80 truncate">{c.category}</span>
                      <span className="text-sm font-semibold text-red-400">${Number(c.amount).toFixed(2)}</span>
                      <span className="text-xs opacity-50 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Income by Category */}
          {chartData.incomeByCategory?.length > 0 && (
            <div className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-bold mb-1">Income by Category</h3>
              <p className="text-sm opacity-50 mb-4">Where your money is coming from</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.incomeByCategory}
                    dataKey="amount" nameKey="category"
                    outerRadius={85} innerRadius={40}
                    labelLine={false} label={renderCustomLabel}
                  >
                    {chartData.incomeByCategory.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `$${Number(v).toFixed(2)}`} contentStyle={CHART_STYLE.contentStyle} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Category list */}
              <div className="mt-3 space-y-2">
                {chartData.incomeByCategory.slice(0, 5).map((c, i) => {
                  const total = chartData.incomeByCategory.reduce((s, x) => s + Number(x.amount), 0);
                  const pct = total > 0 ? ((Number(c.amount) / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={c.category} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                      <span className="text-sm flex-1 opacity-80 truncate">{c.category}</span>
                      <span className="text-sm font-semibold text-green-400">${Number(c.amount).toFixed(2)}</span>
                      <span className="text-xs opacity-50 w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions Table */}
      <div className="p-6 backdrop-blur bg-white/5 border border-white/10 rounded-2xl">
        <h3 className="text-xl font-bold mb-4">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm opacity-70">
              <tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {txs.map(t => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="py-2">{t.date}</td>
                  <td><span className={`px-2 py-1 rounded text-xs ${t.type === 'INCOME' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>{t.type}</span></td>
                  <td>{t.category}</td>
                  <td className="opacity-70">{t.note}</td>
                  <td className={t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}>${Number(t.amount).toFixed(2)}</td>
                  <td><button onClick={() => del(t.id)} className="text-red-400 hover:text-red-300">✕</button></td>
                </tr>
              ))}
              {txs.length === 0 && <tr><td colSpan="6" className="text-center py-6 opacity-60">No transactions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
