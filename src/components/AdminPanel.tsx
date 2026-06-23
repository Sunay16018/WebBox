import React, { useState, useEffect } from 'react';
import { Shield, Users, Database, ArrowLeft, RefreshCw, Layers, CheckCircle, Search, Edit2, Check, UserCheck, AlertTriangle } from 'lucide-react';

interface Visitor {
  fingerprint: string;
  count: number;
  lastResetDate: string;
  customLimit: number;
  ip: string;
  userAgent: string;
  screen: string;
  tz: string;
  cores: string;
  gpu: string;
  lastActive: string;
}

interface AdminPanelProps {
  pagePath: string;
  onNavigate: (path: string | null) => void;
}

export default function AdminPanel({ pagePath, onNavigate }: AdminPanelProps) {
  const [password, setPassword] = useState(() => {
    // Attempt extract password from pathname "/admin/[password]"
    const parts = pagePath.split('/');
    return parts[2] || '';
  });
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFingerprint, setEditingFingerprint] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(5);
  const [customPasswordInput, setCustomPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (password) {
      fetchAdminStats(password);
    } else {
      setLoading(false);
    }
  }, [password]);

  const fetchAdminStats = async (pwd: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: pwd })
      });
      
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.list || []);
        setIsAuthorized(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Şifre yetkilendirmesi başarısız oldu.');
        setIsAuthorized(false);
      }
    } catch (err) {
      setErrorMsg('Bağlantı hatası oluştu, sunucuya erişilemiyor.');
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPasswordInput.trim()) {
      setPassword(customPasswordInput);
      window.history.replaceState({}, '', `/admin/${customPasswordInput}`);
    }
  };

  const handleUpdateLimit = async (fingerprint: string, customLimit: number, count?: number) => {
    try {
      const res = await fetch('/api/admin/update-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          fingerprint,
          customLimit,
          count
        })
      });

      if (res.ok) {
        setFeedbackMsg('Kullanıcı hakları başarıyla güncellendi!');
        setEditingFingerprint(null);
        // Refresh local stats
        fetchAdminStats(password);
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        const data = await res.json();
        alert(data.error || 'Güncelleme hatası.');
      }
    } catch (e) {
      alert('İşlem tamamlanamadı.');
    }
  };

  const handleResetUsage = (visitor: Visitor) => {
    // Reset usage count to 0, maintaining custom limits
    handleUpdateLimit(visitor.fingerprint, visitor.customLimit, 0);
  };

  // Humanize OS & Browser helper from User-Agent
  const parseUserAgent = (ua: string) => {
    let os = "Unknown OS";
    let browser = "Unknown Browser";
    
    if (/windows/i.test(ua)) os = "Windows";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/android/i.test(ua)) os = "Android";
    else if (/linux/i.test(ua)) os = "Linux";
    
    if (/chrome|crios/i.test(ua) && !/edge|edg/i.test(ua)) browser = "Chrome";
    else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
    else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
    else if (/edge|edg/i.test(ua)) browser = "Edge";
    else if (/opera|opr/i.test(ua)) browser = "Opera";
    
    return { os, browser };
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 10) return 'Az önce';
      if (diffSecs < 60) return `${diffSecs} saniye önce`;
      if (diffMins < 60) return `${diffMins} dakika önce`;
      if (diffHours < 24) return `${diffHours} saat önce`;
      return `${diffDays} gün önce`;
    } catch (e) {
      return 'Bilinmiyor';
    }
  };

  // Filter unique results
  const filteredVisitors = visitors.filter(v => {
    const uaInfo = parseUserAgent(v.userAgent);
    const query = searchQuery.toLowerCase();
    return (
      v.ip.toLowerCase().includes(query) ||
      v.fingerprint.toLowerCase().includes(query) ||
      uaInfo.os.toLowerCase().includes(query) ||
      uaInfo.browser.toLowerCase().includes(query) ||
      (v.gpu && v.gpu.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 py-20" id="admin-loader-container">
        <RefreshCw className="w-8 h-8 text-neutral-900 animate-spin" />
        <p className="text-sm font-medium text-neutral-500 font-mono">Veriler doğrulanıyor ve yükleniyor...</p>
      </div>
    );
  }

  // Unauthorized Layout (Password prompt)
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-neutral-100 shadow-xl overflow-hidden p-8 space-y-6" id="admin-login-card">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Yönetim Paneli Girişi</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            WeBox ziyaretçi kayıtlarını inceleme, limit takibi yapma ve özel PDF hakkı belirleme konsoluna erişmek için şifrenizi girin.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-100/50 rounded-2xl flex items-start gap-3 text-xs text-rose-700 leading-relaxed font-sans">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-700">Yönetici Şifresi</label>
            <input
              type="password"
              placeholder="Şifrenizi yazın..."
              required
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-black outline-none rounded-xl text-sm transition-all shadow-inner"
              value={customPasswordInput}
              onChange={(e) => setCustomPasswordInput(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all font-sans flex items-center justify-center gap-2"
          >
            Sisteme Bağlan <ArrowLeft className="w-4 h-4 rotate-180" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate(null)}
            className="text-xs text-neutral-400 hover:text-neutral-900 font-semibold flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            ← Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="admin-panel-viewport">
      {/* Dynamic Alert Banner */}
      {feedbackMsg && (
        <div className="fixed top-24 right-5 z-50 bg-neutral-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-neutral-700/50 flex items-center gap-2 text-xs font-medium font-sans">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {feedbackMsg}
        </div>
      )}

      {/* Header Segment */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-neutral-100 pb-6 select-none" id="admin-header">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold rounded-full font-mono uppercase tracking-wider">
              YÖNETİCİ AKTİF
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-neutral-900">WeBox Kontrol Paneli</h2>
          <p className="text-xs text-neutral-500">
            Sistemdeki cihazları anlık görüntüleyin, kotalarını ("pdf hakkı") artırıp sıfırlayın. Her cihaz benzersizdir ve deduplike listelenir.
          </p>
        </div>

        <button
          onClick={() => onNavigate(null)}
          className="text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-300 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Ana Sayfaya Dön
        </button>
      </div>

      {/* Stat Summariser widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="admin-summary-grid">
        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center justify-center text-neutral-700">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Toplam Tekil Cihaz</span>
            <p className="text-2xl font-extrabold text-neutral-900 font-mono">{visitors.length}</p>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-700" id="stats-active-today">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Limit Artırılanlar</span>
            <p className="text-2xl font-extrabold text-neutral-900 font-mono">{visitors.filter(v => v.customLimit > 5).length}</p>
          </div>
        </div>

        <div className="bg-white border border-neutral-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center text-amber-700">
            <Database className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Bugün PDF Oluşturanlar</span>
            <p className="text-2xl font-extrabold text-neutral-900 font-mono">{visitors.filter(v => v.count > 0).length}</p>
          </div>
        </div>
      </div>

      {/* Control Box: Search and Live Filter */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden" id="admin-table-controls">
        <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50/50">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="IP, işletim sistemi, GPU veya cihaz ID ara..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-neutral-200 focus:border-black outline-none rounded-xl text-xs transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchAdminStats(password)}
              className="p-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl text-neutral-600 transition-colors"
              title="Yenile"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-neutral-400 font-medium">Toplam {filteredVisitors.length} kayıt eşleşti</span>
          </div>
        </div>

        {/* Visitor Table & List */}
        <div className="overflow-x-auto min-w-full">
          {filteredVisitors.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="text-sm text-neutral-500 font-medium">Aradığınız kriterlere uygun kayıt bulunamadı.</p>
              <p className="text-xs text-neutral-400">Üstteki arama filtresini kontrol etmeyi deneyin veya bir süre sonra yenileyin.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/30 text-neutral-400 font-extrabold select-none">
                  <th className="p-4 uppercase tracking-wider font-mono text-[10px]">Cihaz ID & IP Adresi</th>
                  <th className="p-4 uppercase tracking-wider font-mono text-[10px]">Sistem / Donanım Bilgileri</th>
                  <th className="p-4 uppercase tracking-wider font-mono text-[10px]">Saat / Zaman dilimi</th>
                  <th className="p-4 uppercase tracking-wider font-mono text-[10px]">PDF Hakkı / Limit Durumu</th>
                  <th className="p-4 text-right uppercase tracking-wider font-mono text-[10px]">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredVisitors.map((visitor) => {
                  const uaInfo = parseUserAgent(visitor.userAgent);
                  const isEditing = editingFingerprint === visitor.fingerprint;
                  const remaining = Math.max(0, visitor.customLimit - visitor.count);

                  return (
                    <tr key={visitor.fingerprint} className="hover:bg-neutral-50/50 transition-colors" id={`visitor-row-${visitor.fingerprint.substring(0, 10)}`}>
                      {/* IP and ID details */}
                      <td className="p-4 space-y-1 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-neutral-900 text-sm select-all">{visitor.ip}</span>
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono break-all line-clamp-1 select-all" title={visitor.fingerprint}>
                          ID: {visitor.fingerprint.replace('uuid:', '').split('-scr:')[0] || visitor.fingerprint}
                        </div>
                      </td>

                      {/* System Spec details */}
                      <td className="p-4 space-y-1.5">
                        <div className="flex flex-wrap gap-1.5">
                          {/* OS badge */}
                          <span className={`px-2 py-0.5 rounded-md font-semibold font-sans text-[10px] ${
                            uaInfo.os === 'iOS' || uaInfo.os === 'macOS' ? 'bg-neutral-900 text-white' :
                            uaInfo.os === 'Windows' ? 'bg-blue-50 text-blue-600 border border-blue-100/50' :
                            uaInfo.os === 'Android' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                            'bg-neutral-100 text-neutral-600'
                          }`}>
                            {uaInfo.os}
                          </span>
                          {/* Browser brand badge */}
                          <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-200 rounded-md font-semibold text-neutral-700 text-[10px]">
                            {uaInfo.browser}
                          </span>
                          {/* Screen dimensions */}
                          <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-100 text-neutral-500 rounded font-mono text-[9px]" title="Ekran çözünürlüğü">
                            {visitor.screen || 'Unknown'}
                          </span>
                          {/* Hardware CPUs */}
                          <span className="px-1.5 py-0.5 bg-neutral-50 border border-neutral-100 text-neutral-500 rounded font-mono text-[9px]" title="İşlemci Çekirdek Sayısı">
                            {visitor.cores ? `${visitor.cores} Core` : ''}
                          </span>
                        </div>
                        
                        {/* GPU / Graphics card identifier */}
                        {visitor.gpu && (
                          <div className="text-[10px] text-neutral-400 line-clamp-1 select-none font-mono" title={visitor.gpu}>
                            GPU: {visitor.gpu}
                          </div>
                        )}
                      </td>

                      {/* Time and timezone information */}
                      <td className="p-4 space-y-1.5 max-w-xs">
                        <div className="font-semibold text-neutral-800 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          {formatRelativeTime(visitor.lastActive)}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono font-medium line-clamp-1" title="Kullanıcı Zaman Dilimi">
                          {visitor.tz || 'UTC'}
                        </div>
                      </td>

                      {/* Usage quota and limits */}
                      <td className="p-4 space-y-1 font-mono">
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="9999"
                                value={editLimitValue}
                                onChange={(e) => setEditLimitValue(parseInt(e.target.value) || 0)}
                                className="w-14 px-1.5 py-1 border border-neutral-300 rounded focus:border-black text-xs outline-none bg-white font-bold"
                              />
                              <button
                                onClick={() => handleUpdateLimit(visitor.fingerprint, editLimitValue)}
                                className="p-1 bgColor hover:bg-emerald-600 bg-emerald-500 text-white rounded transition-colors"
                                title="Onayla"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-neutral-100/70 border border-neutral-200/50 rounded-lg px-2 py-1">
                              <span className="font-black text-xs text-neutral-800">{remaining}</span>
                              <span className="text-[10px] text-neutral-400">/ {visitor.customLimit} kalan</span>
                              <button
                                onClick={() => {
                                  setEditingFingerprint(visitor.fingerprint);
                                  setEditLimitValue(visitor.customLimit);
                                }}
                                className="ml-1.5 text-neutral-400 hover:text-neutral-900 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] text-neutral-400 font-sans" title="Bugün yapılan istek sayısı">
                          Bugün üretilen PDF: <strong className="text-neutral-600">{visitor.count}</strong>
                        </div>
                      </td>

                      {/* Access admin controllers */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetUsage(visitor)}
                            className="px-2.5 py-1 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 font-bold font-sans rounded-lg transition-colors shadow-sm"
                            title="İstek sayacını 0'a çekerek hakkını sıfırla, limiti koru."
                          >
                            Hakkı Sıfırla (0'la)
                          </button>
                          
                          <button
                            onClick={() => handleUpdateLimit(visitor.fingerprint, 999)}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold font-sans rounded-lg transition-colors shadow"
                            title="1000 PDF Hakkı Tanımla"
                          >
                            + Sınırsız Yap
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
