import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';
import '@fontsource/noto-naskh-arabic/600.css';
import '@fontsource/noto-naskh-arabic/700.css';
import { useMemo, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '../icons';
import { addDays, fmt, shortDate, todayIso, uid, usePersisted, useRoute, useTitle, useToast } from '../kit';
import { Bar, CountUp, Dialog, Link, s, Tag, Toast } from '../ui';
import j from './jamiaty.module.css';

/* ───────── البيانات التجريبية ───────── */
const UNI = 'جامعة الياسمين';
const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
const hours = [8, 9, 10, 11, 12, 13, 14, 15];

interface Section {
  id: string;
  instructor: string;
  room: string;
  days: number[];
  start: number;
  end: number;
  capacity: number;
  enrolled: number;
}
interface Course {
  code: string;
  name: string;
  credits: number;
  prereq: string[];
  dept: string;
  about: string;
  sections: Section[];
}

const courses: Course[] = [
  { code: 'CS301', name: 'بنى المعطيات', credits: 3, prereq: ['CS201'], dept: 'هندسة البرمجيات', about: 'القوائم المترابطة، المكدسات والأرتال، الأشجار الثنائية وأشجار البحث المتوازنة، جداول التقطيع، والرسوم البيانية مع تحليل تعقيد كل عملية.', sections: [
    { id: 'CS301-1', instructor: 'د. سامر الحلبي', room: 'مدرج 2', days: [0, 2], start: 8, end: 10, capacity: 40, enrolled: 38 },
    { id: 'CS301-2', instructor: 'د. ريم الأتاسي', room: 'قاعة 114', days: [1, 3], start: 12, end: 14, capacity: 40, enrolled: 40 },
  ] },
  { code: 'CS305', name: 'قواعد المعطيات', credits: 3, prereq: ['CS201'], dept: 'نظم المعلومات', about: 'النموذج العلائقي، لغة SQL، التطبيع، الفهارس، المعاملات والتزامن، مع مشروع تصميم قاعدة معطيات كاملة.', sections: [
    { id: 'CS305-1', instructor: 'د. لمى شيخ الأرض', room: 'مخبر 3', days: [0, 2], start: 10, end: 12, capacity: 35, enrolled: 21 },
    { id: 'CS305-2', instructor: 'د. لمى شيخ الأرض', room: 'مخبر 3', days: [1, 3], start: 8, end: 10, capacity: 35, enrolled: 30 },
  ] },
  { code: 'CS310', name: 'نظم التشغيل', credits: 3, prereq: ['CS301'], dept: 'هندسة الحاسوب', about: 'العمليات والخيوط، الجدولة، إدارة الذاكرة والذاكرة الافتراضية، نظم الملفات، والتزامن والاستعصاء.', sections: [
    { id: 'CS310-1', instructor: 'د. باسل قباني', room: 'مدرج 1', days: [1, 3], start: 10, end: 12, capacity: 30, enrolled: 12 },
  ] },
  { code: 'CS320', name: 'هندسة البرمجيات', credits: 3, prereq: ['CS201'], dept: 'هندسة البرمجيات', about: 'دورة حياة البرمجيات، تحليل المتطلبات، UML، أنماط التصميم، الاختبار، والعمل بمنهجيات Agile ضمن فرق.', sections: [
    { id: 'CS320-1', instructor: 'د. هالة المصري', room: 'قاعة 210', days: [0, 2], start: 8, end: 10, capacity: 45, enrolled: 26 },
    { id: 'CS320-2', instructor: 'د. هالة المصري', room: 'قاعة 210', days: [4], start: 10, end: 13, capacity: 45, enrolled: 9 },
  ] },
  { code: 'MA210', name: 'الاحتمالات والإحصاء', credits: 3, prereq: ['MA101'], dept: 'الرياضيات', about: 'فضاء الاحتمال، المتحولات العشوائية، التوزيعات الشائعة، التقدير واختبار الفرضيات والانحدار الخطي.', sections: [
    { id: 'MA210-1', instructor: 'د. عمر الخطيب', room: 'مدرج 4', days: [1, 3], start: 14, end: 16, capacity: 60, enrolled: 44 },
  ] },
  { code: 'CS330', name: 'شبكات الحاسوب', credits: 3, prereq: ['CS210'], dept: 'هندسة الحاسوب', about: 'نموذج الطبقات، بروتوكولات TCP/IP، التوجيه، الشبكات اللاسلكية، وأساسيات أمن الشبكات.', sections: [
    { id: 'CS330-1', instructor: 'د. نور الدين حمود', room: 'مخبر 5', days: [0, 2], start: 12, end: 14, capacity: 30, enrolled: 17 },
  ] },
  { code: 'HU110', name: 'مهارات التواصل', credits: 2, prereq: [], dept: 'العلوم الإنسانية', about: 'الكتابة الأكاديمية، العرض الشفهي، العمل ضمن فريق، وأخلاقيات المهنة.', sections: [
    { id: 'HU110-1', instructor: 'أ. ديما سلوم', room: 'قاعة 008', days: [4], start: 8, end: 10, capacity: 80, enrolled: 52 },
    { id: 'HU110-2', instructor: 'أ. ديما سلوم', room: 'قاعة 008', days: [2], start: 14, end: 16, capacity: 80, enrolled: 79 },
  ] },
];

const completed: { code: string; name: string; credits: number; grade: string; term: string }[] = [
  { code: 'CS101', name: 'مدخل إلى البرمجة', credits: 3, grade: 'A', term: 'خريف 2023' },
  { code: 'MA101', name: 'التحليل الرياضي 1', credits: 3, grade: 'B+', term: 'خريف 2023' },
  { code: 'EN101', name: 'اللغة الإنكليزية 1', credits: 2, grade: 'A', term: 'خريف 2023' },
  { code: 'CS201', name: 'البرمجة غرضية التوجه', credits: 3, grade: 'A-', term: 'ربيع 2024' },
  { code: 'MA102', name: 'الجبر الخطي', credits: 3, grade: 'B', term: 'ربيع 2024' },
  { code: 'CS205', name: 'الرياضيات المتقطعة', credits: 3, grade: 'C+', term: 'خريف 2024' },
  { code: 'PH101', name: 'الفيزياء العامة', credits: 3, grade: 'B-', term: 'خريف 2024' },
];
const points: Record<string, number> = { A: 4, 'A-': 3.7, 'B+': 3.3, B: 3, 'B-': 2.7, 'C+': 2.3, C: 2, D: 1, F: 0 };

const t0 = todayIso();
const deadlines = [
  { at: addDays(t0, 2), title: 'آخر موعد للتسجيل والحذف والإضافة' },
  { at: addDays(t0, 9), title: 'استحقاق القسط الأول من الرسوم' },
  { at: addDays(t0, 26), title: 'امتحانات منتصف الفصل' },
  { at: addDays(t0, 61), title: 'بداية الامتحانات النهائية' },
];
const news = [
  { title: 'افتتاح مخبر الذكاء الاصطناعي في كلية الهندسة المعلوماتية', at: addDays(t0, -1) },
  { title: 'تمديد ساعات المكتبة المركزية خلال فترة الامتحانات', at: addDays(t0, -4) },
  { title: 'فتح باب التقديم لمنح التفوق للعام الدراسي القادم', at: addDays(t0, -8) },
];

const MAX_CREDITS = 18;
const CREDIT_FEE = 45_000;
const BASE_FEE = 120_000;
const INSTALLMENTS = 3;

const allSections = courses.flatMap((c) => c.sections.map((sec) => ({ ...sec, course: c })));
const sectionById = (id: string) => allSections.find((x) => x.id === id)!;
const secNo = (id: string) => id.split('-')[1];
const timeLabel = (sec: Section) => `${sec.days.map((d) => days[d]).join(' و')} · ${sec.start}:00–${sec.end}:00`;
const overlaps = (a: Section, b: Section) => a.days.some((d) => b.days.includes(d)) && a.start < b.end && b.start < a.end;
const blockColors = ['#0f2747', '#8c1d2c', '#1d6b4f', '#7a5b12', '#1b3a66', '#5b2a5e'];

interface Request {
  id: string;
  section: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}
interface Payment {
  id: string;
  amount: number;
  at: string;
}

const pages = ['home', 'register', 'schedule', 'grades', 'fees', 'registrar', 'course'] as const;
type Page = (typeof pages)[number];
const pageTitle: Record<Page, string> = {
  home: 'لوحتي',
  register: 'تسجيل المقررات',
  schedule: 'جدولي الأسبوعي',
  grades: 'السجل الأكاديمي',
  fees: 'الرسوم والمدفوعات',
  registrar: 'لوحة شؤون الطلاب',
  course: 'دليل المقررات',
};

export default function Jamiaty() {
  const { page, param, go, href } = useRoute('jamiaty', pages, 'home');
  const [role, setRole] = usePersisted<'student' | 'staff'>('jamiaty:role', 'student');
  const [registered, setRegistered] = usePersisted<string[]>('jamiaty:registered', ['CS305-1']);
  const [requests, setRequests] = usePersisted<Request[]>('jamiaty:requests', [
    { id: 'r0', section: 'CS301-2', reason: 'مقرر متطلب لمشروع التخرج هذا الفصل.', status: 'pending' },
  ]);
  const [payments, setPayments] = usePersisted<Payment[]>('jamiaty:payments', []);
  const [query, setQuery] = useState('');
  const [override, setOverride] = useState<string | null>(null);
  const [toast, show] = useToast();
  useTitle(`${page === 'course' && param ? courses.find((c) => c.code === param)?.name ?? pageTitle.course : pageTitle[page]} | بوابة ${UNI}`);

  const done = new Set(completed.map((c) => c.code));
  const regSections = registered.map(sectionById);
  const credits = regSections.reduce((a, x) => a + x.course.credits, 0);
  const isReg = (id: string) => registered.includes(id);
  const seats = (sec: Section) => sec.enrolled + (isReg(sec.id) ? 1 : 0);

  function check(sec: Section & { course: Course }): string | null {
    if (done.has(sec.course.code)) return 'منجز سابقاً';
    const missing = sec.course.prereq.filter((p) => !done.has(p));
    if (missing.length) return `يتطلب ${missing.join('، ')}`;
    const other = regSections.find((x) => x.course.code === sec.course.code);
    if (other) return `مسجّل في الشعبة ${secNo(other.id)}`;
    if (credits + sec.course.credits > MAX_CREDITS) return `يتجاوز ${MAX_CREDITS} ساعة`;
    const clash = regSections.find((x) => overlaps(x, sec));
    if (clash) return `يتعارض مع ${clash.course.name}`;
    if (sec.enrolled >= sec.capacity) return 'الشعبة ممتلئة';
    return null;
  }

  const register = (id: string) => {
    const sec = sectionById(id);
    const reason = check(sec);
    if (reason) return show(reason, 'err');
    setRegistered((r) => [...r, id]);
    show(`سُجّلت في ${sec.course.name} — الشعبة ${secNo(id)}`);
  };
  const drop = (id: string) => {
    setRegistered((r) => r.filter((x) => x !== id));
    show(`حُذف ${sectionById(id).course.name} من جدولك`);
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const decide = (id: string, status: 'approved' | 'rejected') => {
    const req = requests.find((r) => r.id === id)!;
    const sec = sectionById(req.section);
    if (status === 'approved') {
      const clash = regSections.find((x) => overlaps(x, sec) || x.course.code === sec.course.code);
      if (clash) return show(`لا يمكن الموافقة: يتعارض مع ${clash.course.name} في جدول الطالبة`, 'err');
      if (credits + sec.course.credits > MAX_CREDITS) return show('لا يمكن الموافقة: يتجاوز الحد الأعلى للساعات', 'err');
      setRegistered((r) => [...r, sec.id]);
    }
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    show(status === 'approved' ? 'تمت الموافقة وأُضيف المقرر لجدول الطالبة' : 'رُفض الطلب وأُبلغت الطالبة');
  };

  const fees = credits ? BASE_FEE + credits * CREDIT_FEE : 0;
  const paid = payments.reduce((a, p) => a + p.amount, 0);
  const installment = Math.ceil(fees / INSTALLMENTS);
  const due = Math.max(0, fees - paid);
  const gpa = useMemo(() => completed.reduce((a, c) => a + points[c.grade] * c.credits, 0) / completed.reduce((a, c) => a + c.credits, 0), []);
  const earned = completed.reduce((a, c) => a + c.credits, 0);

  const nav: { id: Page; label: string; icon: IconName; count?: number; staff?: boolean }[] = [
    { id: 'home', label: 'لوحتي', icon: 'home' },
    { id: 'register', label: 'التسجيل', icon: 'book' },
    { id: 'schedule', label: 'الجدول', icon: 'calendar', count: registered.length },
    { id: 'grades', label: 'العلامات', icon: 'award' },
    { id: 'fees', label: 'الرسوم', icon: 'receipt', count: due > 0 ? 1 : 0 },
    { id: 'course', label: 'دليل المقررات', icon: 'doc' },
    { id: 'registrar', label: 'شؤون الطلاب', icon: 'inbox', count: pending.length, staff: true },
  ];
  const L = ({ to, param: p, children, className }: { to: Page; param?: string; children: ReactNode; className?: string }) => (
    <Link to={href(to, p)} go={() => go(to, p)} className={className} current={page === to && (!p || p === param)}>
      {children}
    </Link>
  );
  const courseLink = (c: Course) => (
    <L to="course" param={c.code} className={j.courseLink}>
      {c.name}
    </L>
  );

  const crumbs = (
    <>
      <L to="home">الرئيسية</L> ‹ <span>{role === 'staff' ? 'شؤون الطلاب' : 'الخدمات الأكاديمية'}</span> ‹
    </>
  );

  const shown = allSections.filter((x) => !query || x.course.name.includes(query) || x.course.code.toLowerCase().includes(query.toLowerCase()) || x.instructor.includes(query));

  return (
    <div className={j.theme}>
      <div className={j.utility}>
        <div className={j.utilityIn}>
          <span className={j.utilityLinks}>المكتبة الإلكترونية</span>
          <span className={j.utilityLinks}>البريد الجامعي</span>
          <span className={j.utilityLinks}>دليل الطالب</span>
          <span className={j.spacer} />
          <span>عرض بصفة:</span>
          <div className={j.role} role="group" aria-label="الدور">
            <button aria-pressed={role === 'student'} onClick={() => (setRole('student'), page === 'registrar' && go('home'))}>
              طالبة
            </button>
            <button aria-pressed={role === 'staff'} onClick={() => (setRole('staff'), go('registrar'))}>
              موظف شؤون الطلاب
            </button>
          </div>
        </div>
      </div>
      <header className={j.head}>
        <div className={j.headIn}>
          <Crest />
          <div className={j.uni}>
            <b>{UNI}</b>
            <span>بوابة «جامعتي» للخدمات الأكاديمية</span>
          </div>
          <div className={j.who}>
            <div>
              <b>{role === 'staff' ? 'سامي الدبس' : 'سلمى الشامي'}</b>
              <span>{role === 'staff' ? 'دائرة شؤون الطلاب' : 'هندسة معلوماتية · السنة الثالثة · 2022/0418'}</span>
            </div>
            <i>{role === 'staff' ? 'س' : 'س'}</i>
          </div>
        </div>
      </header>
      <nav className={j.nav} aria-label="القائمة الرئيسية">
        <div className={j.navIn}>
          {nav
            .filter((n) => (role === 'staff' ? n.staff || n.id === 'course' : !n.staff))
            .map((n) => (
              <L key={n.id} to={n.id}>
                <Icon name={n.icon} size={17} />
                {n.label}
                {!!n.count && <em>{n.count}</em>}
              </L>
            ))}
        </div>
      </nav>

      <main className={`${j.page} ${s.enter}`} key={page + param}>
        {page === 'home' && (
          <>
            <div className={j.welcome}>
              <div>
                <h2>أهلاً بكِ، سلمى</h2>
                <p>الفصل الأول 2025 – 2026 · التسجيل مفتوح حتى {shortDate(deadlines[0].at)}</p>
              </div>
            </div>
            <div className={j.kpis}>
              <div>
                <small>المعدل التراكمي</small>
                <b className={s.num}>
                  <CountUp value={gpa} digits={2} />
                </b>
                <em>من 4.00</em>
              </div>
              <div>
                <small>الساعات المنجزة</small>
                <b className={s.num}>
                  <CountUp value={earned} />
                </b>
                <em>من 150 ساعة للتخرج</em>
              </div>
              <div>
                <small>مسجّل هذا الفصل</small>
                <b className={s.num}>{credits}</b>
                <em>{registered.length} مقررات</em>
              </div>
              <div>
                <small>الرصيد المستحق</small>
                <b className={s.num}>
                  <CountUp value={due} />
                </b>
                <em>ل.س</em>
              </div>
            </div>
            <div className={j.cols}>
              <div className={s.stack} style={{ gap: 18 }}>
                <Panel title="محاضرات اليوم والغد">
                  {regSections.length === 0 ? (
                    <p className={s.muted}>لا محاضرات. سجّل مقرراتك أولاً.</p>
                  ) : (
                    <ul className={j.news}>
                      {regSections.map((x) => (
                        <li key={x.id}>
                          {courseLink(x.course)} <span className={s.muted}>· {x.room}</span>
                          <small>
                            {timeLabel(x)} · {x.instructor}
                          </small>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
                <Panel title="إعلانات الجامعة">
                  <ul className={j.news}>
                    {news.map((n) => (
                      <li key={n.title}>
                        <b>{n.title}</b>
                        <small>{shortDate(n.at)}</small>
                      </li>
                    ))}
                  </ul>
                </Panel>
              </div>
              <div className={s.stack} style={{ gap: 18 }}>
                <Panel title="مواعيد مهمة">
                  <ul className={j.timeline}>
                    {deadlines.map((d) => (
                      <li key={d.title}>
                        <div className={j.date}>
                          <b className={s.num}>{new Date(d.at).getDate()}</b>
                          <span>{shortDate(d.at).split(' ').slice(1).join(' ')}</span>
                        </div>
                        <div>{d.title}</div>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="روابط سريعة">
                  <div className={j.quick}>
                    <L to="register">
                      <Icon name="book" /> تسجيل
                    </L>
                    <L to="schedule">
                      <Icon name="calendar" /> جدولي
                    </L>
                    <L to="grades">
                      <Icon name="award" /> علاماتي
                    </L>
                    <L to="fees">
                      <Icon name="receipt" /> الدفع
                    </L>
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )}

        {page === 'register' && (
          <>
            <Title crumbs={crumbs} title="تسجيل المقررات" sub="كل طلب يُفحص فوراً: المتطلبات السابقة، سعة الشعبة، تعارض المواعيد، والحد الأعلى للساعات.">
              <input className={s.input} style={{ width: 260 }} placeholder="ابحث باسم المقرر أو الرمز أو المدرّس" value={query} onChange={(e) => setQuery(e.target.value)} />
            </Title>
            <Panel title={<span>الحمل الدراسي</span>} action={<span className={s.num}>{credits} / {MAX_CREDITS} ساعة</span>}>
              <Bar value={(credits / MAX_CREDITS) * 100} />
            </Panel>
            <Panel title="الشعب المطروحة — الفصل الأول" flush>
              <div className={j.scroll}>
                <table className={j.table}>
                  <thead>
                    <tr>
                      <th>المقرر</th>
                      <th>الشعبة</th>
                      <th>المدرّس والقاعة</th>
                      <th>الموعد</th>
                      <th>المقاعد</th>
                      <th>الحالة</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((sec) => {
                      const mine = isReg(sec.id);
                      const reason = mine ? null : check(sec);
                      const asked = requests.find((r) => r.section === sec.id && r.status === 'pending');
                      return (
                        <tr key={sec.id}>
                          <td>
                            {courseLink(sec.course)}
                            <div className={`${s.small} ${s.muted}`}>
                              <span className={s.num}>{sec.course.code}</span> · {sec.course.credits} ساعات
                            </div>
                          </td>
                          <td className={s.num}>{secNo(sec.id)}</td>
                          <td>
                            {sec.instructor}
                            <div className={`${s.small} ${s.muted}`}>{sec.room}</div>
                          </td>
                          <td className={s.small}>{timeLabel(sec)}</td>
                          <td className={s.num}>
                            {seats(sec)}/{sec.capacity}
                          </td>
                          <td>{mine ? <Tag t="ok">مسجّل</Tag> : asked ? <Tag t="warn">بانتظار شؤون الطلاب</Tag> : reason ? <Tag t="bad">{reason}</Tag> : <Tag t="info">متاح</Tag>}</td>
                          <td>
                            {mine ? (
                              <button className={`${s.btnDanger} ${s.sm}`} onClick={() => drop(sec.id)}>
                                حذف
                              </button>
                            ) : reason === 'الشعبة ممتلئة' && !asked ? (
                              <button className={`${s.btn} ${s.sm}`} onClick={() => setOverride(sec.id)}>
                                طلب استثناء
                              </button>
                            ) : (
                              <button className={`${s.btnPrimary} ${s.sm}`} disabled={!!reason || !!asked} onClick={() => register(sec.id)}>
                                تسجيل
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}

        {page === 'schedule' && (
          <>
            <Title crumbs={crumbs} title="جدولي الأسبوعي" sub={`${registered.length} مقررات · ${credits} ساعة معتمدة`}>
              <button className={s.btn} onClick={() => window.print()}>
                طباعة الجدول
              </button>
            </Title>
            {registered.length === 0 ? (
              <p className={s.empty}>لم تسجّل أي مقرر بعد.</p>
            ) : (
              <div className={`${j.panel} ${j.scroll}`}>
                <div style={{ display: 'grid', gridTemplateColumns: `64px repeat(${days.length}, minmax(120px, 1fr))`, gridTemplateRows: `38px repeat(${hours.length}, 54px)`, minWidth: 700 }}>
                  <div style={{ background: 'var(--navy)' }} />
                  {days.map((d, i) => (
                    <div key={d} style={{ gridColumn: i + 2, gridRow: 1, display: 'grid', placeItems: 'center', fontWeight: 700, background: 'var(--navy)', color: '#fff' }}>
                      {d}
                    </div>
                  ))}
                  {hours.map((h, i) => (
                    <div key={h} className={`${s.small} ${s.muted} ${s.num}`} style={{ gridColumn: 1, gridRow: i + 2, padding: 4, borderTop: '1px solid var(--border)' }}>
                      {h}:00
                    </div>
                  ))}
                  {hours.map((_, r) => days.map((__, c) => <div key={`${r}-${c}`} style={{ gridColumn: c + 2, gridRow: r + 2, borderTop: '1px solid var(--border)', borderInlineStart: '1px solid var(--border)' }} />))}
                  {regSections.flatMap((sec, k) =>
                    sec.days.map((d) => (
                      <div
                        key={`${sec.id}-${d}`}
                        style={{ gridColumn: d + 2, gridRow: `${sec.start - hours[0] + 2} / ${sec.end - hours[0] + 2}`, margin: 3, padding: '6px 8px', background: blockColors[k % 6], color: '#fff', fontSize: '0.78rem', lineHeight: 1.45, overflow: 'hidden', borderInlineStart: '4px solid var(--gold)' }}
                      >
                        <b>{sec.course.name}</b>
                        <div style={{ opacity: 0.85 }}>{sec.room}</div>
                      </div>
                    )),
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {page === 'grades' && (
          <>
            <Title crumbs={crumbs} title="السجل الأكاديمي" sub="كشف علامات غير رسمي — للنسخة المصدّقة راجع دائرة الامتحانات." />
            <div className={j.kpis}>
              <div>
                <small>المعدل التراكمي</small>
                <b className={s.num}>{gpa.toFixed(2)}</b>
                <em>{gpa >= 3.5 ? 'امتياز' : gpa >= 3 ? 'جيد جداً' : 'جيد'}</em>
              </div>
              <div>
                <small>الساعات المنجزة</small>
                <b className={s.num}>{earned}</b>
              </div>
              <div>
                <small>نسبة الإنجاز للتخرج</small>
                <b className={s.num}>{Math.round((earned / 150) * 100)}%</b>
              </div>
            </div>
            {[...new Set(completed.map((c) => c.term))].map((term) => {
              const list = completed.filter((c) => c.term === term);
              const termGpa = list.reduce((a, c) => a + points[c.grade] * c.credits, 0) / list.reduce((a, c) => a + c.credits, 0);
              return (
                <Panel key={term} title={term} action={<span className={s.num}>المعدل الفصلي {termGpa.toFixed(2)}</span>} flush>
                  <div className={j.scroll}>
                    <table className={j.table}>
                      <thead>
                        <tr>
                          <th>الرمز</th>
                          <th>المقرر</th>
                          <th>الساعات</th>
                          <th>التقدير</th>
                          <th>النقاط</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((c) => (
                          <tr key={c.code}>
                            <td className={s.num}>{c.code}</td>
                            <td>{c.name}</td>
                            <td className={s.num}>{c.credits}</td>
                            <td>
                              <Tag t={points[c.grade] >= 3.3 ? 'ok' : points[c.grade] >= 2.3 ? 'info' : 'warn'}>
                                <span className={s.num}>{c.grade}</span>
                              </Tag>
                            </td>
                            <td className={s.num}>{(points[c.grade] * c.credits).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              );
            })}
          </>
        )}

        {page === 'fees' && (
          <>
            <Title crumbs={crumbs} title="الرسوم والمدفوعات" sub="تُحسب الرسوم من الساعات المسجّلة لحظياً، وتُقسَّط على ثلاث دفعات." />
            <div className={j.kpis}>
              <div>
                <small>إجمالي رسوم الفصل</small>
                <b className={s.num}>{fmt(fees)}</b>
                <em>ل.س</em>
              </div>
              <div>
                <small>المدفوع</small>
                <b className={s.num}>{fmt(paid)}</b>
                <em>ل.س</em>
              </div>
              <div>
                <small>المتبقي</small>
                <b className={s.num}>{fmt(due)}</b>
                <em>{due === 0 && fees > 0 ? 'لا ذمم مستحقة' : 'ل.س'}</em>
              </div>
            </div>
            <div className={j.cols}>
              <Panel title="إيصالات الدفع" flush>
                {payments.length === 0 ? (
                  <p className={j.panelBody} style={{ color: 'var(--text-muted)' }}>
                    لا إيصالات بعد.
                  </p>
                ) : (
                  <table className={j.table}>
                    <thead>
                      <tr>
                        <th>رقم الإيصال</th>
                        <th>التاريخ</th>
                        <th>المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, i) => (
                        <tr key={p.id}>
                          <td className={s.num}>#{20250401 + i}</td>
                          <td className={s.num}>{new Date(p.at).toLocaleString('ar-SY-u-nu-latn')}</td>
                          <td className={s.num}>{fmt(p.amount)} ل.س</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Panel>
              <Panel title="تفصيل الرسوم">
                <ul className={s.list}>
                  <li>
                    <span className={s.grow}>رسم التسجيل الثابت</span>
                    <b className={s.num}>{fmt(credits ? BASE_FEE : 0)}</b>
                  </li>
                  <li>
                    <span className={s.grow}>
                      {credits} ساعة × {fmt(CREDIT_FEE)}
                    </span>
                    <b className={s.num}>{fmt(credits * CREDIT_FEE)}</b>
                  </li>
                  <li>
                    <span className={s.grow}>قيمة القسط</span>
                    <b className={s.num}>{fmt(installment)}</b>
                  </li>
                </ul>
                <button
                  className={s.btnPrimary}
                  style={{ marginTop: 12, width: '100%' }}
                  disabled={due === 0}
                  onClick={() => {
                    const amount = Math.min(installment, due);
                    setPayments((p) => [...p, { id: uid(), amount, at: new Date().toISOString() }]);
                    show(`دُفع ${fmt(amount)} ل.س وصدر الإيصال`);
                  }}
                >
                  {due === 0 ? (fees ? 'الرسوم مسددة' : 'سجّل مقررات أولاً') : `دفع القسط ${Math.min(payments.length + 1, INSTALLMENTS)} من ${INSTALLMENTS}`}
                </button>
              </Panel>
            </div>
          </>
        )}

        {page === 'course' && (() => {
          const c = courses.find((x) => x.code === param);
          if (!c)
            return (
              <>
                <Title crumbs={crumbs} title="دليل المقررات" sub="كل المقررات المطروحة هذا الفصل مع وصفها ومتطلباتها." />
                <div className={s.grid}>
                  {courses.map((x) => (
                    <section key={x.code} className={j.panel}>
                      <h2>
                        <L to="course" param={x.code} className={j.courseLink}>
                          {x.name}
                        </L>
                        <span className={`${s.num} ${s.muted}`}>{x.code}</span>
                      </h2>
                      <div className={j.panelBody}>
                        <p className={s.muted}>{x.about}</p>
                        <p className={s.small} style={{ marginTop: 8 }}>
                          {x.dept} · {x.credits} ساعات · {x.sections.length} شعب
                        </p>
                      </div>
                    </section>
                  ))}
                </div>
              </>
            );
          return (
            <>
              <Title crumbs={crumbs} title={c.name} sub={`${c.code} · ${c.dept} · ${c.credits} ساعات معتمدة`}>
                <L to="register" className={s.btnPrimary}>
                  التسجيل في المقرر
                </L>
              </Title>
              <div className={j.cols}>
                <Panel title="وصف المقرر">
                  <p style={{ lineHeight: 2 }}>{c.about}</p>
                </Panel>
                <Panel title="المتطلبات السابقة">
                  {c.prereq.length === 0 ? (
                    <p className={s.muted}>لا متطلبات.</p>
                  ) : (
                    <ul className={s.list}>
                      {c.prereq.map((p) => (
                        <li key={p}>
                          <span className={`${s.grow} ${s.num}`}>{p}</span>
                          {done.has(p) ? <Tag t="ok">منجز</Tag> : <Tag t="bad">غير منجز</Tag>}
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
              <Panel title="الشعب" flush>
                <table className={j.table}>
                  <thead>
                    <tr>
                      <th>الشعبة</th>
                      <th>المدرّس</th>
                      <th>القاعة</th>
                      <th>الموعد</th>
                      <th>الإشغال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.sections.map((x) => (
                      <tr key={x.id}>
                        <td className={s.num}>{secNo(x.id)}</td>
                        <td>{x.instructor}</td>
                        <td>{x.room}</td>
                        <td>{timeLabel(x)}</td>
                        <td style={{ minWidth: 140 }}>
                          <Bar value={(seats(x) / x.capacity) * 100} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </>
          );
        })()}

        {page === 'registrar' && (
          <>
            <Title crumbs={crumbs} title="لوحة شؤون الطلاب" sub="ما ينتظر قرارك فقط. الموافقة تُفحص من جديد على جدول الطالب قبل اعتمادها." />
            <div className={j.kpis}>
              <div>
                <small>طلبات معلّقة</small>
                <b className={s.num}>{pending.length}</b>
              </div>
              <div>
                <small>شعب ممتلئة</small>
                <b className={s.num}>{allSections.filter((x) => seats(x) >= x.capacity).length}</b>
              </div>
              <div>
                <small>نسبة الإشغال</small>
                <b className={s.num}>{Math.round((allSections.reduce((a, x) => a + seats(x), 0) / allSections.reduce((a, x) => a + x.capacity, 0)) * 100)}%</b>
              </div>
            </div>
            <Panel title="طلبات تجاوز السعة">
              {requests.length === 0 ? (
                <p className={s.muted}>لا طلبات.</p>
              ) : (
                <ul className={s.list}>
                  {requests.map((r) => {
                    const sec = sectionById(r.section);
                    return (
                      <li key={r.id} style={{ flexWrap: 'wrap' }}>
                        <div className={s.grow}>
                          <b>سلمى الشامي</b> ← {courseLink(sec.course)} (الشعبة <span className={s.num}>{secNo(sec.id)}</span>)
                          <div className={`${s.small} ${s.muted}`}>{r.reason}</div>
                        </div>
                        {r.status === 'pending' ? (
                          <div className={s.row}>
                            <button className={`${s.btnPrimary} ${s.sm}`} onClick={() => decide(r.id, 'approved')}>
                              موافقة
                            </button>
                            <button className={`${s.btnDanger} ${s.sm}`} onClick={() => decide(r.id, 'rejected')}>
                              رفض
                            </button>
                          </div>
                        ) : (
                          <Tag t={r.status === 'approved' ? 'ok' : 'bad'}>{r.status === 'approved' ? 'مقبول' : 'مرفوض'}</Tag>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
            <Panel title="إشغال الشعب">
              <ul className={s.list}>
                {allSections.map((x) => (
                  <li key={x.id}>
                    <span style={{ width: 190 }}>
                      {courseLink(x.course)} <span className={`${s.num} ${s.muted}`}>{secNo(x.id)}</span>
                    </span>
                    <div className={s.grow}>
                      <Bar value={(seats(x) / x.capacity) * 100} color={seats(x) >= x.capacity ? 'var(--crimson)' : undefined} />
                    </div>
                    <span className={`${s.num} ${s.small}`}>
                      {seats(x)}/{x.capacity}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </main>

      <footer className={j.foot}>
        <div className={j.footIn}>
          <span>© {UNI} — دائرة المعلوماتية</span>
          <span>الدعم الفني: تحويلة 2210 · من الأحد إلى الخميس 8:00–15:00</span>
        </div>
      </footer>

      {override && (
        <OverrideDialog
          section={sectionById(override).course.name}
          onClose={() => setOverride(null)}
          onSend={(reason) => {
            setRequests((rs) => [...rs, { id: uid(), section: override, reason, status: 'pending' }]);
            setOverride(null);
            show('أُرسل الطلب إلى شؤون الطلاب');
          }}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}

function Title({ title, sub, crumbs, children }: { title: string; sub?: ReactNode; crumbs: ReactNode; children?: ReactNode }) {
  return (
    <header className={j.title}>
      <div>
        <nav className={j.crumbs} aria-label="مسار الصفحة">
          {crumbs} <span>{title}</span>
        </nav>
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className={s.row}>{children}</div>}
    </header>
  );
}

function Panel({ title, action, children, flush }: { title: ReactNode; action?: ReactNode; children: ReactNode; flush?: boolean }) {
  return (
    <section className={j.panel}>
      <h2>
        {title}
        {action}
      </h2>
      <div className={flush ? '' : j.panelBody}>{children}</div>
    </section>
  );
}

function Crest() {
  return (
    <svg className={j.crest} viewBox="0 0 50 56" aria-hidden="true">
      <path d="M25 2 47 9v18c0 14-9 23-22 27C12 50 3 41 3 27V9z" fill="#0f2747" stroke="#c9a227" strokeWidth="2" />
      <path d="M25 13 l3.2 6.6 7.3 1-5.3 5.1 1.3 7.2L25 29.5l-6.5 3.4 1.3-7.2-5.3-5.1 7.3-1z" fill="#c9a227" />
      <path d="M13 40h24M15 44h20" stroke="#c9a227" strokeWidth="1.6" />
    </svg>
  );
}

function OverrideDialog({ section, onClose, onSend }: { section: string; onClose: () => void; onSend: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <Dialog title={`طلب استثناء — ${section}`} onClose={onClose}>
      <form
        className={s.stack}
        onSubmit={(e) => {
          e.preventDefault();
          if (reason.trim().length >= 8) onSend(reason.trim());
        }}
      >
        <label className={s.field}>
          <span>سبب الطلب</span>
          <textarea className={s.input} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثلاً: المقرر متطلب للتخرج هذا الفصل" />
        </label>
        <div className={s.row}>
          <button className={s.btnPrimary} disabled={reason.trim().length < 8}>
            إرسال
          </button>
          <button type="button" className={s.btn} onClick={onClose}>
            إلغاء
          </button>
        </div>
      </form>
    </Dialog>
  );
}
