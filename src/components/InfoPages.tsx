import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  HelpCircle, 
  Mail, 
  Map, 
  Scale, 
  Flame, 
  User, 
  Send, 
  CheckCircle2, 
  Compass, 
  ArrowLeft,
  ChevronDown
} from 'lucide-react';

interface InfoPagesProps {
  pagePath: string;
  onNavigate: (path: string | null) => void;
  currentLanguage: string;
}

const PageWrapper = ({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) => (
  <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.01)] p-8 sm:p-12 space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-6">
      <div>
        <button 
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Ana Sayfaya Dön
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 font-sans">
          {title}
        </h1>
      </div>
      <div className="hidden sm:inline-flex px-3 py-1 bg-neutral-50 border border-neutral-100 rounded-full text-[11px] font-mono font-medium text-neutral-500">
        WEBOX LEGAL SECURE
      </div>
    </div>
    <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

export default function InfoPages({ pagePath, onNavigate, currentLanguage }: InfoPagesProps) {
  // Contact state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // FAQ accordion state
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({
    0: true, // open first by default
  });

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("https://formsubmit.co/ajax/webox.info@proton.me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          _subject: formData.subject ? `WeBox Destek: ${formData.subject}` : "WeBox İletişim Formu",
          message: formData.message
        })
      });

      if (response.ok) {
        setSentSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        throw new Error(data.message || "Mesaj gönderilemedi. Lütfen webox.info@proton.me adresini deneyin.");
      }
    } catch (err: any) {
      console.error("Form transmission error:", err);
      setErrorMessage(err.message || "E-posta gönderilirken bir ağ hatası oluştu. Lütfen webox.info@proton.me e-posta adresine doğrudan yazmayı deneyiniz.");
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToHome = () => {
    onNavigate(null);
  };

  switch (pagePath) {
    case '/hakkimizda':
      return (
        <PageWrapper title="Hakkımızda" onBack={handleBackToHome}>
          <div className="space-y-6">
            <p className="text-base text-neutral-700 font-medium">
              WeBox, kullanıcı gizliliğini ilk sıraya koyan, tamamen tarayıcı üzerinde çalışan modern ve güvenli bir çevrimdışı işlem (Offline Sandbox) araç kutusudur.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2">
                <h3 className="font-bold text-neutral-950 font-sans flex items-center gap-2">
                  <span>🎯</span> Biz Kimiz ve Amacımız Ne?
                </h3>
                <p className="text-xs text-neutral-500">
                  Amacımız, her gün yaptığınız PDF birleştirme, resim boyutlandırma, belge çevirme ve medya dosyalarını dönüştürme gibi hassas işlerinizi sıfır riskle çözüme kavuşturmaktır. WeBox, bağımsız web teknolojileri mühendisleri tarafından tasarlanmış olup tüm gücünü cihazınızın işlemcisinden alır.
                </p>
              </div>

              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-2">
                <h3 className="font-bold text-neutral-950 font-sans flex items-center gap-2">
                  <span>🔒</span> Neden Sıfır Sunucu?
                </h3>
                <p className="text-xs text-neutral-500">
                  Geleneksel web sitelerinde dosyalarınız uzak sunuculara yüklenir. WeBox ise dosyalarınızı asla internete göndermez. Tarayıcınızın içinde oluşturulan özel bir izolasyon alanında (client-side sandbox) saniyeler içinde işlemlerinizi tamamlar.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="text-lg font-bold text-neutral-900">Temel Değerlerimiz</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-500">
                <li><strong className="text-neutral-800">Mutlak Gizlilik:</strong> Hiçbir dosyanız, resminiz veya metniniz hiçbir veri depolama birimine gönderilmez. Bilgileriniz sadece size aittir.</li>
                <li><strong className="text-neutral-800">Erişilebilirlik ve Hız:</strong> Dosya yükleme ve indirme sıralarını beklemezsiniz. İnternetiniz yavaş olsa veya kesilse bile araçlarımız tam hızda çalışmaya devam eder.</li>
                <li><strong className="text-neutral-800">Güvenlik:</strong> Kötü amaçlı yazılımlardan uzak, reklamsız, temiz ve kurumsal standartlara uygun API koruması sağlarız.</li>
              </ul>
            </div>

            <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
              <p className="text-xs text-emerald-800 leading-relaxed font-sans font-medium text-center">
                WeBox, tamamen ücretsiz bir projedir. Sitemizin devamlılığını ve barındırma maliyetlerini sizleri rahatsız etmeyecek düzeyde entegre edilmiş Google AdSense reklamları ile karşılamaktayız.
              </p>
            </div>
          </div>
        </PageWrapper>
      );

    case '/iletisim':
      return (
        <PageWrapper title="İletişim" onBack={handleBackToHome}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-6">
              <p className="text-sm text-neutral-600">
                Sorularınız, iş birlikleri, hata bildirimleri veya önerileriniz için bizimle dilediğiniz an iletişime geçebilirsiniz. Size en kısa sürede dönüş sağlayacağız.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="p-2 bg-white rounded-lg border border-neutral-200">
                    <Mail className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-sans">E-Posta Adresimiz</h4>
                    <a 
                      href="mailto:webox.info@proton.me" 
                      className="text-sm font-semibold text-neutral-800 hover:text-neutral-900 hover:underline"
                    >
                      webox.info@proton.me
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <div className="p-2 bg-white rounded-lg border border-neutral-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-sans">Güvenilir Yanıt</h4>
                    <p className="text-xs text-neutral-500">Gönderilen tüm formlar uçtan uca güvenli olarak incelenir.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 bg-neutral-50 rounded-2xl border border-neutral-100 p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">İletişim Formu</h3>
              {sentSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-neutral-200 rounded-xl p-6 text-center space-y-3"
                >
                  <div className="inline-flex p-3 bg-emerald-50 rounded-full text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-neutral-900">Mesajınız İletildi!</h4>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Bizimle iletişime geçtiğiniz için teşekkür ederiz. Mesajınız başarıyla <strong className="text-neutral-800">webox.info@proton.me</strong> adresine yönlendirilmiş olup, 24 saat içinde yanıt verilecektir.
                  </p>
                  <button 
                    onClick={() => setSentSuccess(false)}
                    className="text-xs px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold transition-all mt-4"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {errorMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs leading-relaxed font-semibold flex items-start gap-2"
                    >
                      <span className="flex-shrink-0">⚠️</span>
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Adınız Soyadınız *</label>
                      <input 
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-neutral-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 text-neutral-800"
                        placeholder="Örn. Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">E-Posta Adresiniz *</label>
                      <input 
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white border border-neutral-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 text-neutral-800"
                        placeholder="Örn. ahmet@gmail.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Konu</label>
                    <input 
                      type="text"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white border border-neutral-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 text-neutral-800"
                      placeholder="Örn. Hata Bildirimi / Öneri"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wide">Mesajınız *</label>
                    <textarea 
                      required
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white border border-neutral-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-neutral-900 text-neutral-800 resize-none"
                      placeholder="Lütfen iletinizi buraya yazınız..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    {isSending ? (
                      <>Gönderiliyor...</>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Mesaj Gönder
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </PageWrapper>
      );

    case '/gizlilik-politikasi':
      return (
        <PageWrapper title="Gizlilik Politikası" onBack={handleBackToHome}>
          <div className="space-y-6 text-xs text-neutral-500 leading-relaxed font-sans">
            <p className="text-xs text-neutral-400">Son Güncelleme: 19 Haziran 2026</p>
            
            <p className="text-sm font-semibold text-neutral-700">
              WeBox web sitemizi ziyaretlerinizde gizliliğinizi ve kişisel verilerinizin korunmasını güvence altına almak için yüksek güvenlik standartları uygulamaktayız. Bu gizlilik sözleşmesi, kullanıcı haklarınızı ve platformumuzun çalışma politikasını açıklamaktadır.
            </p>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">1. Sıfır Veri Depolama Politikası (Client-Side Computing)</h3>
              <p>
                WeBox platformu üzerinden yüklenen hiçbir dosya (metin, PDF, ses, resim vb.) uzak bir sunucuya asla gönderilmez. Sitemizdeki tüm sıkıştırma, birleştirme, kesme, düzenleme ve yerel çeviri işlemleri tamamen kullanıcının kullandığı tarayıcı belleğinde (Client-Side) gerçekleşir. Bu nedenle, sisteme yüklenen dosyalar ve içerikler üzerinde hiçbir şekilde veri toplama, kaydetme, işleme veya depolama faaliyeti yürütülmez.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">2. Google AdSense ve Üçüncü Taraf Reklam Çerezleri</h3>
              <p>
                Platformumuz, sitemizin sürdürülebilirliğini sağlamak amacıyla Google AdSense üçüncü taraf reklam hizmetlerini barındırabilir. Google, web sitemizde reklam yayınlamak için çerezlerden (cookies) yararlanır. Bu amaçla Google:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Sitemizi veya internetteki diğer siteleri ziyaretlerinize dayanan reklamlar sunmak amacıyla "DoubleClick DART" çerezi kullanabilmektedir.</li>
                <li>Bu çerezler üzerinden kullanıcıların ilgi alanlarını analiz ederek daha kişiselleştirilmiş reklam deneyimi vadeder.</li>
                <li>İlgi alanına dayalı reklamcılıktan çıkmak veya tercihlerinizi düzenlemek için <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="text-neutral-900 font-bold underline">Google Reklam ve Gizlilik Politikası</a> sayfasını ziyaret edebilirsiniz.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">3. Web Günlüğü Dosyaları (Log Files)</h3>
              <p>
                Birçok standart sunucu sisteminde olduğu gibi, WeBox sitemizin performans analizi ve genel site trafiği analizi için log dosyalarını kullanabilir. Bu log dosyaları yalnızca IP adresiniz, kullandığınız tarayıcı türü, internet servis sağlayıcınız (ISP), siteye giriş ve çıkış sayfalarınız ile tıklama istatistikleriniz gibi genel standart sistem loglarından oluşmaktadır. Bu veriler kesinlikle kişisel kimlik bilgilerinizle ilişkilendirilmez.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">4. GDPR Sabitleri ve KVKK Haklarınız</h3>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, WeBox üzerinde kişisel verileriniz işlenmediği veya sunucularımızda saklanmadığı için, silme veya devretme hakkınız doğal olarak korunmaktadır. Tarayıcı önbelleğinizi temizlediğiniz taktirde sitemizde tutulan yerel ayarlarınız da tamamen kalkmış olur.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">5. İletişim</h3>
              <p>
                Gizlilik politikamız ile ilgili bilgi edinmek veya sorularınızı paylaşmak isterseniz bizimle her zaman <strong className="text-neutral-800">webox.info@proton.me</strong> e-posta adresi üzerinden irtibata geçebilirsiniz.
              </p>
            </section>
          </div>
        </PageWrapper>
      );

    case '/kullanim-sartlari':
      return (
        <PageWrapper title="Kullanım Şartları" onBack={handleBackToHome}>
          <div className="space-y-6 text-xs text-neutral-500 leading-relaxed font-sans">
            <p className="text-xs text-neutral-400">Son Güncelleme: 19 Haziran 2026</p>
            
            <p className="text-sm text-neutral-700 font-semibold">
              WeBox web sitesini kullanarak, aşağıda belirtilen kullanım haklarını ve hizmet kurallarını kabul etmiş sayılırsınız. Lütfen hizmetlerimizden faydalanmadan önce bu sözleşmeyi dikkatlice inceleyiniz.
            </p>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">1. Kabul Edilebilir Kullanım</h3>
              <p>
                WeBox web sitesi, bireysel ve ticari kullanıcıların belge yönetimi, çeviri ve medya dönüştürme işlemlerini güvenli şekilde yapabilmeleri için tamamen ücretsiz olarak sunulmuş bir araç setidir. Sitemizin sunucu kapasitesini bozacak, verilerin akışını haksız şekilde engelleyecek veya sistem açıklarından faydalanmaya yönelik her türlü hileli/zararlı faaliyet kesinlikle yasaktır.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">2. Sorumluluk Sınırlandırması (Disclaimer)</h3>
              <p>
                WeBox, araçlarımızın üretmiş olduğu çıktıların doğruluğunu ve tutarlılığını sağlamak için en güncel web algoritmalarını kullanır. Ancak, tüm işlemler yerel olarak tarayıcınızın donanım gücüyle sınırlı olarak yürütüldüğü için oluşabilecek dönüştürme gecikmelerinden veya dosya uyumsuzluklarından dolayı WeBox herhangi bir sorumluluk kabul etmez. Tüm sorumluluk dosyayı işleten kullanıcıya aittir.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">3. Telif Hakları ve Tescil Temsili</h3>
              <p>
                Sitemiz üzerinden işlenen hiçbir belgenin telif hakkı WeBox'a devredilemez. Kullanıcıların telif hakkıyla korunan korumasız müzik, film veya özel tasarımları yasa dışı çoğaltması ve dağıtması kullanıcı inisiyatifindedir. WeBox fikri mülkiyet haklarını korur ve ihlal iddiaları doğrultusunda gerekli uyarıları sağlar. Sitenin tüm tasarım ve görsel kaynakları WeBox tescilinde korunmaktadır.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">4. Şartların Güncellenmesi</h3>
              <p>
                Kullanıcılarımız ve web sistemleri gerekliliklerine göre bu kullanım şartları zaman içinde güncellenebilir. Değişikliklerden haberdar olmak için bu sayfayı belirli aralıklarla kontrol etmeniz önerilir.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900">İletişim</h3>
              <p>Sorularınız için bizimle <strong className="text-neutral-800">webox.info@proton.me</strong> adresinden irtibat kurabilirsiniz.</p>
            </section>
          </div>
        </PageWrapper>
      );

    case '/cerez-politikasi':
      return (
        <PageWrapper title="Çerez Politikası" onBack={handleBackToHome}>
          <div className="space-y-6 text-xs text-neutral-500 leading-relaxed font-sans">
            <p className="text-xs text-neutral-400">Son Güncelleme: 19 Haziran 2026</p>
            
            <p className="text-sm text-neutral-700 font-medium">
              Bu Çerez Politikası, WeBox web sitemizin çerezleri (cookies) nasıl ve hangi amaçlarla kullandığını açıklamaktadır. Sitemizi kullanarak çerezlerin belirtilen kurallar çerçevesinde cihazınıza kaydedilmesini kabul etmiş olursunuz.
            </p>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">1. Çerez (Cookie) Nedir?</h3>
              <p>
                Çerezler, ziyaret ettiğiniz bir web sitesi veya servis sağlayıcı tarafından bilgisayarınıza veya mobil cihazınıza kaydedilen, sitemizin sizi hatırlamasına, ayarlarınızı korumasına ve performans analitiği yapmasına yardımcı olan çok küçük boyutlu metin dosyalarıdır.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">2. Sitemizde Kullanılan Çerez Türleri</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-neutral-500">
                <li><strong className="text-neutral-800">Zorunlu / İşlevsel Çerezler:</strong> Sitemizi sorunsuz olarak kullanmanızı sağlar. Örneğin, sitemizdeki dil ayarlarınızı (Türkçe, İngilizce vb.) tarayıcı kapatılsa dahi hatırlamak için <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700">webox_lang</code> adında işlevsel bir çerez tutulur.</li>
                <li><strong className="text-neutral-800">Analitik ve Performans Çerezleri:</strong> Google Analytics gibi servislerin yardımıyla siteyi kaç kişinin ziyaret ettiğini, kullanıcıların hangi sayfalarda daha çok vakit geçirdiğini ölçümleyen anonim çerezlerdir.</li>
                <li><strong className="text-neutral-800">Pazarlama ve Reklam Çerezleri:</strong> Google AdSense reklam ağı tarafından ziyaret alışkanlıklarınıza ve sitemizdeki hareketlerinize uygun şekilde daha alakalı reklamlar sunmak için yerleştirilen üçüncü taraf çerezleridir.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">3. Çerezleri Nasıl Devre Dışı Bırakabilirsiniz?</h3>
              <p>
                Çerezlerin birçoğu tarayıcınızın ayarlar sekmesinden kolaylıkla engellenebilir veya temizlenebilir. Kullandığınız tarayıcının ayarlar bölümüne (Örn. Chrome &rarr; Güvenlik ve Gizlilik &rarr; Çerezler ve Diğer Site Verileri) giderek site bazında veya genel olarak çerez kullanımını kapatma imkanına sahipsiniz. Çerezleri tamamen devre dışı bırakmanız halinde WeBox üzerindeki dil tercihleriniz de dahil olmak üzere bazı işlevlerin düzgün çalışmayabileceğini unutmayınız.
              </p>
            </section>
          </div>
        </PageWrapper>
      );

    case '/sss':
      return (
        <PageWrapper title="Sıkça Sorulan Sorular (S.S.S.)" onBack={handleBackToHome}>
          <div className="space-y-6">
            <p className="text-sm text-neutral-600">
              WeBox, güvenli, yerel ve sıfır gecikmeli çevrimiçi dosya üreticinizdir. Sitemizle ilgili en çok merak edilen konuları aşağıda listeledik:
            </p>

            <div className="space-y-4">
              {[
                {
                  q: "1. WeBox tamamen ücretsiz bir servis midir?",
                  a: "Evet! WeBox bünyesinde yer alan Belge Çeviricisi, PDF Birleştiricisi, Video-Audio Ayrıştırıcısı, Filigran Ekleme ve benzeri tüm araç seti %100 ücretsiz olarak sunulmaktadır. Sınır veya engel bulunmamaktadır."
                },
                {
                  q: "2. Yüklediğim belgeler, PDF'ler veya hassas görseller güvende mi?",
                  a: "Evet, son derece güvendedir. WeBox, sunucu barındırmayan (Zero-Server) bir istemci tarafı mimarisine sahiptir. Dosyanız, bilgisayarınızdan veya telefonunuzdan dışarıya asla transfer edilmez. Tüm işlem tarayıcınızın içerisindeki geçici bellek bölgesinde yürütülüp anında imha edilir."
                },
                {
                  q: "3. İnternet bağlatım koparsa veya çevrimdışı olursam sitemiz çalışır mı?",
                  a: "Evet, sitemizi bir kez ziyaret edip araçların önbelleğinin yüklenmesini sağladıktan sonra, WeBox yerel API özellikleri sayesinde tamamen internetsiz (çevrimdışı/offline) olarak da görevlerini başarabilir."
                },
                {
                  q: "4. WeBox'da herhangi bir maksimum dosya boyutu sınırı var mı?",
                  a: "Hayır. Uzak bir sunucuya dosya transferi yapılmadığı için yükleme ve indirme limiti teorik olarak yoktur. Gücü ve kapasitesi yalnızca kullanmakta olduğunuz bilgisayarın veya mobil cihazın sahip olduğu RAM hafızası ile doğru orantılıdır."
                },
                {
                  q: "5. Destek almak için kiminle iletişim kurabilirim?",
                  a: "Tüm sorularınız, reklam talepleriniz veya hata bildirimleriniz için WeBox ekibine doğrudan aktif resmi mail adresimiz olan webox.info@proton.me üzerinden veya İletişim sayfasındaki form aracılığıyla ulaşabilirsiniz."
                }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden transition-all duration-200"
                >
                  <button 
                    onClick={() => toggleFaq(i)}
                    className="w-full text-left p-6 flex items-center justify-between font-sans font-bold text-neutral-900 group"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 group-hover:text-neutral-600 transition-transform ${faqOpen[i] ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen[i] && (
                    <div className="px-6 pb-6 text-xs text-neutral-500 leading-relaxed pt-1 border-t border-neutral-100/30">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </PageWrapper>
      );

    case '/topluluk-kurallari':
      return (
        <PageWrapper title="Topluluk Kuralları" onBack={handleBackToHome}>
          <div className="space-y-6 text-xs text-neutral-500 leading-relaxed font-sans">
            <p className="text-xs text-neutral-400">Son Güncelleme: 19 Haziran 2026</p>
            
            <p className="text-sm text-neutral-700 font-medium">
              WeBox, her yaştan ve her seviyeden kullanıcının güvenle, etik standartlarda hizmet alabildiği profesyonel ve saygılı bir web platformudur. Bu bütünlüğü muhafaza etmek adına tüm ziyaretçilerimizin uyması gereken temel doğrular aşağıdadır.
            </p>

            <div className="p-6 bg-rose-50/50 border border-rose-100 rounded-2xl space-y-3">
              <h4 className="font-bold text-rose-950 flex items-center gap-1.5 leading-none">
                <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                Uygulanan Temel Kısıtlamalar ve Yasaklar
              </h4>
              <p className="text-xs text-rose-900 leading-relaxed font-medium">
                Sitemiz ve sistemimiz üzerinde küfür, kaba hitap, hakaret, argo konuşmak veya diğer kullanıcıları rahatsız edecek girişimlerde bulunmak kesinlikle yasaktır. Platform genelinde dürüstlük ve saygı esastır.
              </p>
            </div>

            <section className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide">Uymamız Gereken Altın Kurallar</h3>
              <ul className="list-decimal pl-5 space-y-3 text-neutral-500 font-medium">
                <li>
                  <strong className="text-neutral-800">Sözlü İletişim Etiği:</strong> İletişim kanallarımız üzerinden veya destek taleplerinizde argo kelimeler, küfürler, ırkçı ve ayrımcı söylemler barındıran ifadelere kati suretle müsamaha gösterilmez.
                </li>
                <li>
                  <strong className="text-neutral-800">Güvenlik ve Hack Yasakları:</strong> Platformumuzu manipüle etmeye çalışmak, açık taramak, DDoS veya sunucu tıkanıklığı yaratacak özel kodlar çalıştırarak platformun normal işleyişini bozmaya çalışmak yasaktır.
                </li>
                <li>
                  <strong className="text-neutral-800">Yasal Dosya İşleme Standardı:</strong> WeBox sıfır-sunucu politikasına sahip olsa da yasa dışı olarak tescilli dokümanları çoğaltarak kötüye kullanmak veya başkalarının haklarını ihlal etmek sizin sorumluluğunuzdadır.
                </li>
              </ul>
            </section>
          </div>
        </PageWrapper>
      );

    case '/site-haritasi':
      return (
        <PageWrapper title="Site Haritası" onBack={handleBackToHome}>
          <div className="space-y-6 font-sans">
            <p className="text-sm text-neutral-600">
              Sitemizin tüm işlevsel araçlarına ve hukuki doküman / AdSense onay sayfalarına aşağıdaki şematik liste üzerinden kolaylıkla ulaşabilirsiniz:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                <h3 className="font-bold text-neutral-950 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-neutral-800" />
                  Kullanışlı Araçlar Listesi
                </h3>
                <ul className="space-y-2 text-xs font-semibold text-neutral-500 flex flex-col">
                  <li>
                    <a 
                      href="/metin-cevirici" 
                      onClick={(e) => { e.preventDefault(); onNavigate('text-translation'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      🗣️ Metin Çevirici (Text Translator)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/belge-cevirici" 
                      onClick={(e) => { e.preventDefault(); onNavigate('document-translation'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      📄 Belge Çeviricisi (Document Translator)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=format-converter" 
                      onClick={(e) => { e.preventDefault(); onNavigate('format-converter'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      🔄 Evrensel Format Dönüştürücü
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=pdf-merge" 
                      onClick={(e) => { e.preventDefault(); onNavigate('pdf-merge'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      📕 PDF Dosyası Birleştirme (PDF Merger)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=image-to-pdf" 
                      onClick={(e) => { e.preventDefault(); onNavigate('image-to-pdf'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      🖼️ Resimden Özel PDF Dosyası Yapıcı
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=pdf-meta" 
                      onClick={(e) => { e.preventDefault(); onNavigate('pdf-meta'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      ⚡ PDF Metadata Yazıcı ve Güvenlik Kilidi
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=video-audio" 
                      onClick={(e) => { e.preventDefault(); onNavigate('video-audio'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      🎵 Videodan Kaliteli Ses Çıkarıcı
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=media-cutter" 
                      onClick={(e) => { e.preventDefault(); onNavigate('media-cutter'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      ✂️ Hassas Ses ve Medya Kırpıcı
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=batch-resizer" 
                      onClick={(e) => { e.preventDefault(); onNavigate('batch-resizer'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      📦 Toplu Çoklu Görsel Yeniden Boyutlayıcı
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/?tool=image-watermark" 
                      onClick={(e) => { e.preventDefault(); onNavigate('image-watermark'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      🎨 Resimlere Filigran Ekleme Standardı
                    </a>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                <h3 className="font-bold text-neutral-950 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-neutral-800" />
                  Kurumsal ve AdSense Sayfaları
                </h3>
                <ul className="space-y-2 text-xs font-semibold text-neutral-500 flex flex-col">
                  <li>
                    <a 
                      href="/hakkimizda" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/hakkimizda'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      Hakkımızda Sayfası
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/iletisim" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/iletisim'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      İletişim ve Destek Bölümü
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/gizlilik-politikasi" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/gizlilik-politikasi'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5 font-bold text-neutral-900"
                    >
                      Gizlilik Politikası (Privacy Policy)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/kullanim-sartlari" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/kullanim-sartlari'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      Kullanım Şartları (Terms of Use)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/cerez-politikasi" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/cerez-politikasi'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      Çerez Politikası (Cookie Policy)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/sss" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/sss'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      Sıkça Sorulan Sorular (F.A.Q.)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="/topluluk-kurallari" 
                      onClick={(e) => { e.preventDefault(); onNavigate('/topluluk-kurallari'); }}
                      className="hover:text-neutral-900 transition-colors hover:underline inline-block py-0.5"
                    >
                      Topluluk ve Ahlak Kuralları
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </PageWrapper>
      );

    default:
      return (
        <div className="text-center py-20 bg-white border border-neutral-100 rounded-3xl p-8 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-neutral-900">Sayfa Bulunamadı</h2>
          <p className="text-xs text-neutral-500 mt-2">Aradığınız sayfa kaldırılmış veya taşınmış olabilir.</p>
          <button 
            onClick={handleBackToHome}
            className="text-xs font-bold px-4 py-2 mt-6 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      );
  }
}
