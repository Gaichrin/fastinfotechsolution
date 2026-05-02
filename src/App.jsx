import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { DateTime } from 'luxon'
import { useEffect, useMemo, useState } from 'react'

const navItems = [
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Process', href: '#process' },
  { label: 'Appointment', href: '#appointment' },
  { label: 'Contact', href: '#contact' },
]

const projectFilters = ['All', 'Web Apps', 'Mobile', 'Desktop', 'Blockchain', 'Ticketing']

const projects = [
  {
    id: '01',
    name: 'Dial Prayer',
    category: 'Community Web Platform',
    domain: 'dialprayer.com',
    summary:
      'A responsive community platform refined around clearer navigation, repeat engagement, and frictionless access from any device.',
    outcome: 'Improved product structure for a faith-led audience with stronger content hierarchy.',
    tags: ['Responsive Web', 'Product UI', 'Platform UX'],
    filters: ['Web Apps'],
  },
  {
    id: '02',
    name: 'Carbon CO2',
    category: 'Climate Token Product',
    domain: 'carbonco2.info',
    summary:
      'A cleaner digital presence for a climate and carbon-token product connected to Solana, Hydra, and Ethereum ecosystems.',
    outcome: 'A more credible product surface for explaining token utility, project intent, and launch readiness.',
    tags: ['Blockchain', 'Token UX', 'Website'],
    filters: ['Web Apps', 'Blockchain'],
  },
  {
    id: '03',
    name: 'Parasight',
    category: 'Android Research App',
    domain: 'https://play.google.com/store/apps/details?id=com.nrcm.parasight&pcampaignid=web_share',
    summary:
      'A field-ready Android application shaped for practical research workflows and real operating conditions.',
    outcome: 'Mobile-first delivery for teams that need fast entry, dependable flows, and readable screens.',
    tags: ['Android', 'Research Workflow', 'Mobile UX'],
    filters: ['Mobile'],
  },
  {
    id: '04',
    name: 'JDCL',
    category: 'Corporate Website',
    domain: 'jdcl.co.in',
    summary:
      'A business-facing website structured to communicate services, credibility, and company positioning with less friction.',
    outcome: 'A clearer route from company overview to service evaluation and contact intent.',
    tags: ['Corporate Web', 'Information Architecture', 'Responsive'],
    filters: ['Web Apps'],
  },
  {
    id: '05',
    name: 'Lenz Travels',
    category: 'Travel Web and App Product',
    domain: 'App and Website',
    summary:
      'A connected travel experience across mobile and web with a sharper path through discovery, enquiry, and booking intent.',
    outcome: 'Improved product consistency across customer touchpoints.',
    tags: ['Travel UX', 'Mobile', 'Web App'],
    filters: ['Web Apps', 'Mobile'],
  },
  {
    id: '06',
    name: 'Saisabi',
    category: 'Event Ticketing Platform',
    domain: 'saisabi.com',
    summary:
      'An event ticketing and management system with a mobile app for QR-code ticket authentication and on-site validation.',
    outcome:
      'Delivered a companion web application that can generate 1,000 to 5,000 encrypted, password-protected QR tickets in bulk.',
    tags: ['Event Ticketing', 'QR Validation', 'Bulk QR Generator'],
    filters: ['Web Apps', 'Mobile', 'Ticketing'],
  },
  {
    id: '07',
    name: 'Business Operations Tools',
    category: 'Windows and Linux Software',
    domain: 'Custom software systems',
    summary:
      'Desktop software for operations-heavy teams where workflow clarity, system reliability, and practical interfaces matter most.',
    outcome: 'Useful internal tools for business teams working across Windows and Linux environments.',
    tags: ['Desktop UI', 'Windows', 'Linux'],
    filters: ['Desktop'],
  },
]

const serviceGroups = [
  {
    title: 'Custom Software Development',
    text: 'Business systems, internal tools, customer portals, and workflow applications built around real operational needs.',
    items: ['Requirement mapping', 'System architecture', 'Frontend and backend delivery'],
  },
  {
    title: 'Web Application Engineering',
    text: 'Responsive websites, dashboards, admin panels, and product interfaces with clean structure and reliable performance.',
    items: ['React interfaces', 'API integration', 'Responsive UI systems'],
  },
  {
    title: 'Mobile App Development',
    text: 'Android and iOS apps designed for clear navigation, fast task completion, and dependable day-to-day usage.',
    items: ['Android apps', 'iOS apps', 'Mobile product UX'],
  },
  {
    title: 'Desktop and Enterprise Tools',
    text: 'Windows and Linux software for teams that need stable, practical tools for business processes and data handling.',
    items: ['Windows tools', 'Linux utilities', 'Operational workflows'],
  },
  {
    title: 'Blockchain Product Delivery',
    text: 'Token websites, chain-connected product experiences, and launch surfaces that make Web3 products easier to trust.',
    items: ['Token product UX', 'Blockchain websites', 'Wallet-ready flows'],
  },
  {
    title: 'Maintenance and Improvement',
    text: 'Redesigns, performance improvements, bug fixing, release support, and long-term product iteration.',
    items: ['Code cleanup', 'Feature upgrades', 'Release support'],
  },
]

const processSteps = [
  {
    number: '01',
    title: 'Discover',
    text: 'Clarify the business problem, users, platforms, timeline, technical constraints, and launch goals.',
  },
  {
    number: '02',
    title: 'Plan',
    text: 'Define the system architecture, feature scope, delivery milestones, and the right implementation path.',
  },
  {
    number: '03',
    title: 'Design',
    text: 'Shape the user experience, key screens, navigation, content structure, and product behavior before build.',
  },
  {
    number: '04',
    title: 'Build',
    text: 'Develop the product in working increments with frontend, backend, database, integration, and deployment work aligned.',
  },
  {
    number: '05',
    title: 'Launch',
    text: 'Test, deploy, document, and support the product after release so the software stays usable and maintainable.',
  },
]

const deliveryHighlights = [
  { label: 'Platforms', value: 'Web, mobile, desktop, blockchain' },
  { label: 'Engagement', value: 'Design, build, improve, support' },
  { label: 'Output', value: 'Production-ready software systems' },
]

const heroStack = [
  'React interfaces',
  'REST API integration',
  'MySQL-backed workflows',
  'Android and iOS delivery',
  'Windows and Linux software',
  'Token and blockchain products',
]

const projectTypeOptions = [
  'Custom software project',
  'Company website',
  'Web application',
  'Android app',
  'iOS app',
  'Windows software',
  'Linux software',
  'Crypto token product',
  'Blockchain product',
  'Event ticketing system',
  'QR ticket validation app',
  'UI/UX redesign',
]

const defaultWorkingHours = {
  days: [1, 2, 3, 4, 5],
  daysLabel: 'Monday to Friday',
  startValue: '11:00',
  endValue: '16:30',
  startLabel: '11:00 AM',
  endLabel: '04:30 PM',
}

const defaultAppointmentModes = [
  {
    value: 'virtual',
    label: 'Virtual appointment',
    description: 'A Jitsi meeting link and calendar invite will be sent for the confirmed appointment time.',
  },
  {
    value: 'physical',
    label: 'Physical appointment',
    description: 'Meet at the Fast Infotech Solution office.',
  },
]

const calendarDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const pageWidth = 'mx-auto w-[min(1180px,calc(100%-1.25rem))] sm:w-[min(1180px,calc(100%-2rem))]'
const sectionLabel = 'text-sm font-bold uppercase text-[#2563eb]'
const sectionTitle = 'text-3xl font-extrabold leading-tight text-[#111827] sm:text-4xl lg:text-5xl'
const bodyText = 'text-base leading-8 text-[#566070]'
const panelClass = 'rounded-lg border border-[#dde3ea] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)]'
const inputClass =
  'w-full rounded-md border border-[#cfd7e2] bg-white px-4 py-3 text-base text-[#111827] outline-none transition duration-200 placeholder:text-[#8a94a3] focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/12 sm:text-[15px]'
const titleFont = { fontFamily: 'Sora, sans-serif' }
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${apiBaseUrl}${normalizedPath}`
}

function backendAssetUrl(path) {
  if (!path || /^https?:\/\//i.test(path)) {
    return path
  }

  return apiUrl(path)
}

async function readJson(response) {
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.')
    error.payload = data
    throw error
  }

  return data
}

function normalizeAvailability(data) {
  const slots = Array.isArray(data?.slots)
    ? data.slots
      .map((slot) => ({ ...slot, status: 'available' }))
      .sort((a, b) => String(a.start).localeCompare(String(b.start)))
    : []
  const reservedSlots = Array.isArray(data?.reservedSlots)
    ? data.reservedSlots
      .map((slot) => ({ ...slot, status: 'reserved' }))
      .sort((a, b) => String(a.start).localeCompare(String(b.start)))
    : []

  return {
    loading: false,
    error: '',
    timezone: data?.timezone || 'Asia/Kolkata',
    durationMinutes: data?.durationMinutes || 30,
    bookingWindow: data?.bookingWindow || null,
    workingHours: data?.workingHours
      ? { ...defaultWorkingHours, ...data.workingHours }
      : defaultWorkingHours,
    appointmentModes:
      Array.isArray(data?.appointmentModes) && data.appointmentModes.length > 0
        ? data.appointmentModes
        : defaultAppointmentModes,
    slots,
    reservedSlots,
  }
}

function getSlotDateTime(isoValue, timezone) {
  return DateTime.fromISO(isoValue, { zone: timezone })
}

function getSlotDateKey(isoValue, timezone) {
  return getSlotDateTime(isoValue, timezone).toFormat('yyyy-LL-dd')
}

function formatCalendarDateLabel(dateKey, timezone) {
  return DateTime.fromFormat(dateKey, 'yyyy-LL-dd', { zone: timezone }).toFormat('EEEE, dd LLL yyyy')
}

function formatSlotTimeRange(slot, timezone) {
  const start = getSlotDateTime(slot.start, timezone)
  const end = getSlotDateTime(slot.end, timezone)

  if (!start.isValid || !end.isValid) {
    return slot.label
  }

  return `${start.toFormat('hh:mm a')} - ${end.toFormat('hh:mm a')}`
}

function formatBookingWindowLabel(bookingWindow, timezone) {
  if (!bookingWindow?.opensAt || !bookingWindow?.closesAt) {
    return ''
  }

  const opensAt = DateTime.fromISO(bookingWindow.opensAt, { zone: timezone })
  const closesAt = DateTime.fromISO(bookingWindow.closesAt, { zone: timezone })

  if (!opensAt.isValid || !closesAt.isValid) {
    return ''
  }

  return `${opensAt.toFormat('dd LLL yyyy')} to ${closesAt.toFormat('dd LLL yyyy')}`
}

function buildCalendarDays(monthDate, slotsByDate, reservedSlotsByDate, { workingDays, bookingWindow, timezone }) {
  const start = monthDate.startOf('month').startOf('week')
  const end = monthDate.endOf('month').endOf('week')
  const days = []
  const activeWorkingDays =
    Array.isArray(workingDays) && workingDays.length > 0 ? workingDays : defaultWorkingHours.days
  const bookingWindowStart = bookingWindow?.opensAt
    ? DateTime.fromISO(bookingWindow.opensAt, { zone: timezone }).startOf('day')
    : null
  const bookingWindowEnd = bookingWindow?.closesAt
    ? DateTime.fromISO(bookingWindow.closesAt, { zone: timezone }).endOf('day')
    : null

  for (let cursor = start; cursor <= end; cursor = cursor.plus({ days: 1 })) {
    const key = cursor.toFormat('yyyy-LL-dd')
    const slots = slotsByDate[key] || []
    const reservedSlots = reservedSlotsByDate[key] || []
    const isWorkingDay = activeWorkingDays.includes(cursor.weekday)
    const isInsideBookingWindow =
      (!bookingWindowStart || cursor.endOf('day') >= bookingWindowStart) &&
      (!bookingWindowEnd || cursor.startOf('day') <= bookingWindowEnd)
    let availabilityState = 'booked'
    let statusLabel = 'Full'
    let statusHint = 'All slots taken'

    if (slots.length > 0) {
      availabilityState = 'available'
      statusLabel = 'Open'
      statusHint =
        reservedSlots.length > 0
          ? `${slots.length} free, ${reservedSlots.length} reserved`
          : `${slots.length} free slots`
    } else if (reservedSlots.length > 0) {
      availabilityState = 'booked'
      statusLabel = 'Reserved'
      statusHint = 'All slots reserved'
    } else if (!isWorkingDay) {
      availabilityState = 'closed'
      statusLabel = 'Closed'
      statusHint = 'No appointments'
    } else if (!isInsideBookingWindow) {
      availabilityState = 'outside-window'
      statusLabel = 'Later'
      statusHint = 'Not open yet'
    }

    days.push({
      key,
      dayNumber: cursor.day,
      inMonth: cursor.hasSame(monthDate, 'month'),
      isWorkingDay,
      slotCount: slots.length,
      reservedSlotCount: reservedSlots.length,
      slots,
      reservedSlots,
      monthKey: cursor.toFormat('yyyy-LL'),
      isToday: cursor.hasSame(DateTime.now().setZone(monthDate.zone), 'day'),
      availabilityState,
      statusLabel,
      statusHint,
    })
  }

  return days
}

function statusClasses(type) {
  if (type === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }

  if (type === 'error') {
    return 'border-red-200 bg-red-50 text-red-800'
  }

  return 'border-blue-200 bg-blue-50 text-blue-800'
}

function MenuIcon({ isOpen }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {isOpen ? (
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function ArrowIcon({ direction = 'right' }) {
  const path = direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 6l6 6-6 6'

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    company: '',
    subject: '',
    message: '',
  })
  const [contactStatus, setContactStatus] = useState({ type: 'idle', message: '' })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    company: '',
    projectType: projectTypeOptions[0],
    appointmentMode: defaultAppointmentModes[0].value,
    notes: '',
  })
  const [bookingStatus, setBookingStatus] = useState({ type: 'idle', message: '' })
  const [bookingResult, setBookingResult] = useState(null)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [availability, setAvailability] = useState({
    loading: true,
    error: '',
    timezone: 'Asia/Kolkata',
    durationMinutes: 30,
    bookingWindow: null,
    workingHours: defaultWorkingHours,
    appointmentModes: defaultAppointmentModes,
    slots: [],
    reservedSlots: [],
  })
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedDateKey, setSelectedDateKey] = useState('')
  const [calendarMonthKey, setCalendarMonthKey] = useState('')
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  const shouldReduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const progressScale = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.25 })
  const heroVisualY = useSpring(
    useTransform(scrollYProgress, [0, 0.35], [0, shouldReduceMotion ? 0 : -28]),
    { stiffness: 120, damping: 26, mass: 0.45 },
  )

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((project) => project.filters.includes(activeFilter))

  const { slotsByDate, reservedSlotsByDate, displaySlotsByDate, calendarMonthKeys } = useMemo(() => {
    const byDate = {}
    const reservedByDate = {}
    const displayByDate = {}
    const monthKeys = []
    const monthKeySet = new Set()

    function addSlot(slot, target) {
      const slotDateTime = getSlotDateTime(slot.start, availability.timezone)
      const dateKey = slotDateTime.toFormat('yyyy-LL-dd')
      const monthKey = slotDateTime.toFormat('yyyy-LL')

      if (!target[dateKey]) {
        target[dateKey] = []
      }
      target[dateKey].push(slot)

      if (!monthKeySet.has(monthKey)) {
        monthKeySet.add(monthKey)
        monthKeys.push(monthKey)
      }
    }

    for (const slot of availability.slots) {
      addSlot(slot, byDate)
      addSlot(slot, displayByDate)
    }

    for (const slot of availability.reservedSlots) {
      addSlot(slot, reservedByDate)
      addSlot(slot, displayByDate)
    }

    for (const dateSlots of Object.values(displayByDate)) {
      dateSlots.sort((a, b) => String(a.start).localeCompare(String(b.start)))
    }
    monthKeys.sort((a, b) => a.localeCompare(b))

    return {
      slotsByDate: byDate,
      reservedSlotsByDate: reservedByDate,
      displaySlotsByDate: displayByDate,
      calendarMonthKeys: monthKeys,
    }
  }, [availability.slots, availability.reservedSlots, availability.timezone])

  const chosenSlot = availability.slots.find((slot) => slot.start === selectedSlot) || null
  const chosenAppointmentMode =
    availability.appointmentModes.find((mode) => mode.value === bookingForm.appointmentMode) ||
    defaultAppointmentModes[0]
  const liveBookingWindowLabel = formatBookingWindowLabel(
    availability.bookingWindow,
    availability.timezone,
  )
  const selectedDateSlots = selectedDateKey ? slotsByDate[selectedDateKey] || [] : []
  const selectedDateReservedSlots = selectedDateKey ? reservedSlotsByDate[selectedDateKey] || [] : []
  const selectedDateDisplaySlots = selectedDateKey ? displaySlotsByDate[selectedDateKey] || [] : []
  const selectedDateLabel = selectedDateKey
    ? formatCalendarDateLabel(selectedDateKey, availability.timezone)
    : ''
  const activeMonthKey =
    calendarMonthKey ||
    calendarMonthKeys[0] ||
    DateTime.now().setZone(availability.timezone).toFormat('yyyy-LL')
  const activeMonthDate = DateTime.fromFormat(activeMonthKey, 'yyyy-LL', {
    zone: availability.timezone,
  }).startOf('month')
  const calendarDays = buildCalendarDays(activeMonthDate, slotsByDate, reservedSlotsByDate, {
    workingDays: availability.workingHours.days,
    bookingWindow: availability.bookingWindow,
    timezone: availability.timezone,
  })
  const selectedCalendarDay = calendarDays.find((day) => day.key === selectedDateKey) || null
  const selectedDaySummary = selectedCalendarDay
    ? selectedCalendarDay.availabilityState === 'available'
      ? `${selectedDateSlots.length} appointment slots are open on this date.`
      + (selectedDateReservedSlots.length > 0
        ? ` ${selectedDateReservedSlots.length} slot${selectedDateReservedSlots.length === 1 ? ' is' : 's are'} already reserved.`
        : '')
      : selectedCalendarDay.availabilityState === 'closed'
        ? 'Appointments are closed on this day.'
        : selectedCalendarDay.availabilityState === 'outside-window'
          ? 'This date is outside the current booking window.'
          : selectedDateReservedSlots.length > 0
            ? 'All appointment slots on this date are already reserved.'
            : 'This working day is currently fully booked.'
    : 'Select a highlighted date to inspect available appointment slots.'
  const activeMonthLabel = activeMonthDate.toFormat('LLLL yyyy')
  const activeMonthIndex = calendarMonthKeys.indexOf(activeMonthKey)
  const canGoToPreviousMonth = activeMonthIndex > 0
  const canGoToNextMonth =
    activeMonthIndex !== -1 && activeMonthIndex < calendarMonthKeys.length - 1

  useEffect(() => {
    let ignore = false

    async function loadAvailability() {
      setAvailability((current) => ({
        ...current,
        loading: true,
        error: '',
      }))

      try {
        const response = await fetch(apiUrl('/api/availability'))
        const data = await readJson(response)

        if (ignore) return
        setAvailability(normalizeAvailability(data))
      } catch (error) {
        if (ignore) return

        setAvailability({
          loading: false,
          error: error.message || 'Booking availability is not available right now.',
          timezone: 'Asia/Kolkata',
          durationMinutes: 30,
          bookingWindow: null,
          workingHours: defaultWorkingHours,
          appointmentModes: defaultAppointmentModes,
          slots: [],
          reservedSlots: [],
        })
      }
    }

    loadAvailability()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (availability.slots.length === 0) {
      setSelectedSlot('')
      return
    }

    if (!availability.slots.some((slot) => slot.start === selectedSlot)) {
      setSelectedSlot(availability.slots[0].start)
    }
  }, [availability.slots, selectedSlot])

  useEffect(() => {
    if (availability.slots.length === 0 && availability.reservedSlots.length === 0) {
      setSelectedDateKey('')
      setCalendarMonthKey('')
      setIsCalendarModalOpen(false)
      return
    }

    const firstDisplaySlot = availability.slots[0] || availability.reservedSlots[0]
    const firstSlotDateTime = getSlotDateTime(firstDisplaySlot.start, availability.timezone)
    const firstDateKey = firstSlotDateTime.toFormat('yyyy-LL-dd')
    const firstMonthKey = firstSlotDateTime.toFormat('yyyy-LL')

    if (!selectedDateKey) {
      setSelectedDateKey(firstDateKey)
    }

    if (!calendarMonthKey || !calendarMonthKeys.includes(calendarMonthKey)) {
      setCalendarMonthKey(firstMonthKey)
    }
  }, [
    availability.slots,
    availability.reservedSlots,
    availability.timezone,
    selectedDateKey,
    calendarMonthKey,
    calendarMonthKeys,
  ])

  const closeNav = () => setIsNavOpen(false)

  function selectDate(dateKey) {
    const slots = slotsByDate[dateKey] || []
    setSelectedDateKey(dateKey)

    if (slots.length > 0 && !slots.some((slot) => slot.start === selectedSlot)) {
      setSelectedSlot(slots[0].start)
    } else if (slots.length === 0) {
      setSelectedSlot('')
    }
  }

  async function refreshAvailability() {
    setAvailability((current) => ({
      ...current,
      loading: true,
      error: '',
    }))

    try {
      const response = await fetch(apiUrl('/api/availability'))
      const data = await readJson(response)
      setAvailability(normalizeAvailability(data))
    } catch (error) {
      setAvailability((current) => ({
        ...current,
        loading: false,
        error: error.message || 'Unable to refresh availability right now.',
      }))
    }
  }

  function openDateModal(dateKey) {
    selectDate(dateKey)
    setIsCalendarModalOpen(true)
  }

  function handleSlotChoice(slot) {
    if (slot.status === 'reserved') return

    setSelectedDateKey(getSlotDateKey(slot.start, availability.timezone))
    setSelectedSlot(slot.start)
    setIsCalendarModalOpen(false)
  }

  function goToCalendarMonth(direction) {
    if (calendarMonthKeys.length === 0) return

    if (activeMonthIndex === -1) {
      setCalendarMonthKey(calendarMonthKeys[0])
      return
    }

    const nextIndex = activeMonthIndex + direction
    if (nextIndex < 0 || nextIndex >= calendarMonthKeys.length) return
    setCalendarMonthKey(calendarMonthKeys[nextIndex])
  }

  async function handleContactSubmit(event) {
    event.preventDefault()
    setContactSubmitting(true)
    setContactStatus({ type: 'idle', message: '' })

    try {
      const response = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      })
      const data = await readJson(response)

      setContactStatus({ type: 'success', message: data.message })
      setContactForm({
        name: '',
        email: '',
        mobileNumber: '',
        company: '',
        subject: '',
        message: '',
      })
    } catch (error) {
      setContactStatus({
        type: 'error',
        message: error.message || 'We could not send your message right now.',
      })
    } finally {
      setContactSubmitting(false)
    }
  }

  async function handleBookingSubmit(event) {
    event.preventDefault()
    if (!selectedSlot) {
      setBookingStatus({ type: 'error', message: 'Please choose an available time slot first.' })
      return
    }

    setBookingSubmitting(true)
    setBookingStatus({ type: 'idle', message: '' })
    setBookingResult(null)

    try {
      const response = await fetch(apiUrl('/api/appointments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingForm,
          start: selectedSlot,
        }),
      })
      const data = await readJson(response)

      setBookingStatus({ type: 'success', message: data.message })
      setBookingResult(data)
      setBookingForm({
        name: '',
        email: '',
        mobileNumber: '',
        company: '',
        projectType: projectTypeOptions[0],
        appointmentMode: defaultAppointmentModes[0].value,
        notes: '',
      })
      await refreshAvailability()
    } catch (error) {
      if (error.payload?.availability) {
        setAvailability(normalizeAvailability(error.payload.availability))
      }

      setBookingResult(null)
      setBookingStatus({
        type: 'error',
        message: error.payload?.availability
          ? `${error.message || 'We could not complete the appointment booking.'} The available slots below have been refreshed.`
          : error.message || 'We could not complete the appointment booking.',
      })
    } finally {
      setBookingSubmitting(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <div
        className="min-h-screen overflow-x-hidden bg-[#f5f7fb] text-[#111827] antialiased"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <motion.div
          className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-[#0f766e]"
          style={{ scaleX: progressScale }}
        />

        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/96 text-white backdrop-blur-xl">
          <div className={`${pageWidth} flex h-20 items-center justify-between gap-4`}>
            <a
              className="flex min-w-0 items-center gap-3"
              href="#top"
              aria-label="Fast Infotech Solution home"
              onClick={closeNav}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white">
                <img
                  className="h-9 w-9 object-contain"
                  src="/assets/logo-transparent.png"
                  alt="Fast Infotech Solution logo"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-extrabold uppercase leading-tight text-white sm:text-sm">
                  Fast Infotech Solution
                </span>
              </span>
            </a>

            <nav className="hidden items-center gap-1 xl:flex" aria-label="Primary navigation">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  className="px-3 py-2 text-sm font-semibold text-white/70 transition duration-200 hover:text-white"
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <a
                className="hidden min-h-11 items-center rounded-md bg-white px-4 text-sm font-bold text-[#0b1020] transition duration-200 hover:bg-[#e8eef7] sm:inline-flex"
                href="#appointment"
              >
                Book consultation
              </a>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/15 bg-white/8 text-white transition duration-200 hover:bg-white/14 xl:hidden"
                aria-expanded={isNavOpen}
                aria-label="Toggle navigation menu"
                onClick={() => setIsNavOpen((open) => !open)}
              >
                <MenuIcon isOpen={isNavOpen} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isNavOpen ? (
              <motion.div
                className="border-t border-white/10 bg-[#0b1020] xl:hidden"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className={`${pageWidth} grid gap-2 py-4`}>
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      className="rounded-md px-3 py-3 text-base font-semibold text-white/78 transition duration-200 hover:bg-white/8 hover:text-white"
                      href={item.href}
                      onClick={closeNav}
                    >
                      {item.label}
                    </a>
                  ))}
                  <a
                    className="mt-2 inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-bold text-[#0b1020]"
                    href="#appointment"
                    onClick={closeNav}
                  >
                    Book consultation
                  </a>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </header>

        <main>
          <section id="top" className="relative overflow-hidden bg-[#0b1020] text-white">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.22),transparent_32%),linear-gradient(90deg,rgba(15,118,110,0.18),transparent_46%)]" />
            <div className={`${pageWidth} relative grid min-h-[calc(100svh-5rem)] items-center gap-10 py-12 sm:py-16 xl:grid-cols-[1.05fr_0.95fr] xl:gap-12 xl:py-20`}>
              <motion.div
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-sm font-bold uppercase text-[#86efac]">Fast Infotech Solution</p>
                <h1
                  className="mt-5 max-w-3xl text-[2.35rem] font-extrabold leading-tight text-white sm:text-5xl xl:text-6xl"
                  style={titleFont}
                >
                  Professional software development for serious digital products.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">
                  We design, build, and improve websites, web applications, mobile apps, desktop
                  tools, and blockchain product experiences for businesses that need dependable
                  software, clean interfaces, and practical delivery.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <motion.a
                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-5 text-sm font-extrabold text-[#0b1020] transition duration-200 hover:bg-[#e8eef7]"
                    href="#appointment"
                  >
                    Schedule a consultation
                  </motion.a>
                  <motion.a
                    whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                    whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/20 px-5 text-sm font-extrabold text-white transition duration-200 hover:border-white/36 hover:bg-white/8"
                    href="#services"
                  >
                    Explore services
                  </motion.a>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {deliveryHighlights.map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="border-l border-white/18 pl-4"
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + index * 0.06 }}
                    >
                      <strong className="block text-sm font-extrabold text-white">{item.label}</strong>
                      <span className="mt-2 block text-sm leading-6 text-white/60">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative min-h-[27rem] overflow-hidden border border-white/12 bg-white/5 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.24)] sm:min-h-[31rem] sm:p-6 xl:min-h-[34rem]"
                style={{ y: heroVisualY }}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <img
                  className="absolute right-[-3rem] top-[-3rem] h-56 w-56 object-contain opacity-10"
                  src="/assets/logo-transparent.png"
                  alt=""
                  aria-hidden="true"
                />
                <div className="relative z-10 flex h-full min-h-[24rem] flex-col justify-between sm:min-h-[28rem] xl:min-h-[31rem]">
                  <div>
                    <p className="text-sm font-bold uppercase text-[#86efac]">Delivery model</p>
                    <h2 className="mt-4 max-w-sm text-3xl font-extrabold leading-tight text-white" style={titleFont}>
                      From idea to deployed product with one accountable build partner.
                    </h2>
                  </div>

                  <div className="mt-10 grid gap-3">
                    {heroStack.map((item, index) => (
                      <motion.div
                        key={item}
                        className="grid grid-cols-[4rem_1fr] items-center border-b border-white/12 py-3"
                        initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        <span className="text-xs font-bold text-white/38">0{index + 1}</span>
                        <span className="text-sm font-semibold text-white/82">{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-10 grid gap-3 sm:grid-cols-2">
                    <div className="border border-white/12 bg-[#07101f]/70 p-4">
                      <p className="text-xs font-bold uppercase text-white/45">Primary focus</p>
                      <p className="mt-2 text-lg font-extrabold text-white">Reliable business software</p>
                    </div>
                    <div className="border border-white/12 bg-[#07101f]/70 p-4">
                      <p className="text-xs font-bold uppercase text-white/45">Engagement model</p>
                      <p className="mt-2 text-lg font-extrabold text-white">Plan, build, launch, support</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <section id="services" className="border-b border-[#dde3ea] bg-white py-16 sm:py-20 lg:py-24">
            <div className={pageWidth}>
              <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
                <div>
                  <p className={sectionLabel}>Services</p>
                  <h2 className={`${sectionTitle} mt-3`} style={titleFont}>
                    Software services built around business outcomes.
                  </h2>
                </div>
                <p className={`${bodyText} max-w-2xl lg:ml-auto`}>
                  Clients get a direct path from project idea to delivered software, with the right
                  mix of strategy, design, engineering, integration, launch, and support.
                </p>
              </div>

              <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-[#dde3ea] bg-[#dde3ea] md:grid-cols-2 xl:grid-cols-3">
                {serviceGroups.map((service, index) => (
                  <motion.article
                    key={service.title}
                    className="bg-white p-6 sm:p-7"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <span className="text-sm font-extrabold text-[#2563eb]">0{index + 1}</span>
                    <h3 className="mt-4 text-xl font-extrabold leading-snug text-[#111827]" style={titleFont}>
                      {service.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-[#566070]">{service.text}</p>
                    <ul className="mt-5 grid gap-2">
                      {service.items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm font-semibold text-[#111827]">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-[#0f766e]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#f5f7fb] py-16 sm:py-20 lg:py-24">
            <div className={`${pageWidth} grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start`}>
              <div>
                <p className={sectionLabel}>What we deliver</p>
                <h2 className={`${sectionTitle} mt-3`} style={titleFont}>
                  Practical engineering with a polished product experience.
                </h2>
              </div>
              <div className="grid gap-6">
                {[
                  {
                    title: 'Clear requirements before development starts',
                    text: 'Every project begins with scope, user flows, technical requirements, integration needs, and success criteria.',
                  },
                  {
                    title: 'Interfaces that look professional and are easy to use',
                    text: 'Screens are structured for scanning, action, and trust so users can move through the product with confidence.',
                  },
                  {
                    title: 'Maintainable systems for ongoing improvement',
                    text: 'Code structure, deployment, database design, and support needs are considered from the first release.',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="grid gap-4 border-t border-[#cfd7e2] pt-6 sm:grid-cols-[5rem_1fr]"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="text-sm font-extrabold text-[#0f766e]">0{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-extrabold text-[#111827]" style={titleFont}>
                        {item.title}
                      </h3>
                      <p className="mt-3 text-base leading-8 text-[#566070]">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="work" className="border-y border-[#dde3ea] bg-white py-16 sm:py-20 lg:py-24">
            <div className={pageWidth}>
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div>
                  <p className={sectionLabel}>Selected work</p>
                  <h2 className={`${sectionTitle} mt-3`} style={titleFont}>
                    Software projects across business, ticketing, community, travel, research, and token products.
                  </h2>
                </div>
                <p className={`${bodyText} max-w-2xl lg:ml-auto`}>
                  Each project shows the kind of software problems the team handles: platform
                  structure, usability, product clarity, and practical delivery across devices.
                </p>
              </div>

              <LayoutGroup>
                <div className="mt-10 flex flex-wrap gap-2">
                  {projectFilters.map((filter) => {
                    const isActive = activeFilter === filter
                    return (
                      <motion.button
                        key={filter}
                        type="button"
                        className={`relative rounded-md border px-4 py-2.5 text-sm font-bold transition duration-200 ${isActive
                          ? 'border-[#111827] bg-[#111827] text-white'
                          : 'border-[#cfd7e2] bg-white text-[#3f4856] hover:border-[#111827] hover:text-[#111827]'
                          }`}
                        onClick={() => setActiveFilter(filter)}
                        whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      >
                        {isActive ? (
                          <motion.span
                            layoutId="filter-state"
                            className="absolute inset-0 rounded-md bg-[#111827]"
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                          />
                        ) : null}
                        <span className="relative z-10">{filter}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </LayoutGroup>

              <motion.div layout className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project) => (
                    <motion.article
                      layout
                      key={project.name}
                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -16, scale: 0.98 }}
                      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                      className={`${panelClass} flex min-h-[24rem] flex-col p-6`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <span className="text-sm font-extrabold text-[#2563eb]">{project.id}</span>
                        <span className="rounded-md border border-[#dde3ea] bg-[#f5f7fb] px-3 py-1.5 text-xs font-bold text-[#566070]">
                          {project.category}
                        </span>
                      </div>

                      <h3 className="mt-6 text-2xl font-extrabold leading-tight text-[#111827]" style={titleFont}>
                        {project.name}
                      </h3>
                      <p className="mt-4 text-sm leading-7 text-[#566070]">{project.summary}</p>
                      <p className="mt-4 text-sm font-bold leading-7 text-[#111827]">{project.outcome}</p>

                      <div className="mt-auto pt-6">
                        <strong className="text-sm text-[#111827]">{project.domain}</strong>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md border border-[#dde3ea] bg-[#f8fafc] px-3 py-1.5 text-xs font-bold text-[#566070]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </section>

          <section id="process" className="bg-[#0b1020] py-16 text-white sm:py-20 lg:py-24">
            <div className={pageWidth}>
              <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                <div>
                  <p className="text-sm font-bold uppercase text-[#86efac]">Process</p>
                  <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl" style={titleFont}>
                    A straightforward delivery path from scope to launch.
                  </h2>
                </div>
                <p className="max-w-2xl text-base leading-8 text-white/68 lg:ml-auto">
                  Every engagement moves through clear decisions, visible milestones, working
                  increments, testing, deployment, and practical post-launch support.
                </p>
              </div>

              <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 md:grid-cols-2 xl:grid-cols-5">
                {processSteps.map((step, index) => (
                  <motion.article
                    key={step.number}
                    className="bg-[#0b1020] p-6"
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className="text-sm font-extrabold text-[#86efac]">{step.number}</span>
                    <h3 className="mt-5 text-xl font-extrabold text-white" style={titleFont}>
                      {step.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-white/62">{step.text}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <section id="contact" className="bg-[#f5f7fb] py-16 sm:py-20 lg:py-24">
            <div className={pageWidth}>
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div>
                  <p className={sectionLabel}>Start a project</p>
                  <h2 className={`${sectionTitle} mt-3`} style={titleFont}>
                    Tell us what you need to build, improve, or launch.
                  </h2>
                </div>
                <p className={`${bodyText} max-w-2xl lg:ml-auto`}>
                  Use the enquiry form for written project details or book a consultation slot for
                  a focused discussion about scope, platform, budget, and timeline.
                </p>
              </div>

              <div className="mt-12 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                <motion.article
                  className={`${panelClass} p-6 sm:p-8`}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <p className={sectionLabel}>Project enquiry</p>
                  <h3 className="mt-3 text-2xl font-extrabold leading-tight text-[#111827]" style={titleFont}>
                    Send project details
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#566070]">
                    Share the product type, target users, platform, timeline, and any existing
                    website or app that needs improvement.
                  </p>

                  <AnimatePresence>
                    {contactStatus.message ? (
                      <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                        className={`mt-5 rounded-md border px-4 py-3 text-sm leading-6 ${statusClasses(contactStatus.type)}`}
                      >
                        {contactStatus.message}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <form className="mt-6 grid gap-4" onSubmit={handleContactSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        type="text"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(event) =>
                          setContactForm((current) => ({ ...current, name: event.target.value }))
                        }
                        required
                      />
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="Email address"
                        value={contactForm.email}
                        onChange={(event) =>
                          setContactForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        type="tel"
                        placeholder="Mobile number"
                        value={contactForm.mobileNumber}
                        onChange={(event) =>
                          setContactForm((current) => ({
                            ...current,
                            mobileNumber: event.target.value,
                          }))
                        }
                        required
                      />
                      <input
                        className={inputClass}
                        type="text"
                        placeholder="Company name"
                        value={contactForm.company}
                        onChange={(event) => setContactForm((current) => ({ ...current, company: event.target.value }))}
                      />
                    </div>

                    <input
                      className={inputClass}
                      type="text"
                      placeholder="Project subject"
                      value={contactForm.subject}
                      onChange={(event) => setContactForm((current) => ({ ...current, subject: event.target.value }))}
                    />

                    <textarea
                      className={`${inputClass} min-h-36 resize-y`}
                      placeholder="Describe the software you need..."
                      value={contactForm.message}
                      onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
                      required
                    />

                    <motion.button
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#111827] px-5 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(17,24,39,0.16)] transition duration-200 hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={contactSubmitting}
                    >
                      {contactSubmitting ? 'Sending...' : 'Send enquiry'}
                    </motion.button>
                  </form>
                </motion.article>

                <motion.article
                  id="appointment"
                  className={`${panelClass} p-4 sm:p-6 xl:p-8`}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className={sectionLabel}>Consultation calendar</p>
                      <h3 className="mt-3 text-2xl font-extrabold leading-tight text-[#111827]" style={titleFont}>
                        Book a project discussion
                      </h3>
                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#566070]">
                        Choose an available time in {availability.timezone}. Slots run{' '}
                        {availability.workingHours.daysLabel},{' '}
                        {availability.workingHours.startLabel} to {availability.workingHours.endLabel}.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-[#cfd7e2] bg-white px-4 text-sm font-bold text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb]"
                      onClick={refreshAvailability}
                    >
                      Refresh slots
                    </button>
                  </div>

                  {liveBookingWindowLabel ? (
                    <p className="mt-4 text-sm leading-7 text-[#566070]">
                      Live booking window: <span className="font-bold text-[#111827]">{liveBookingWindowLabel}</span>
                    </p>
                  ) : null}

                  <AnimatePresence>
                    {bookingStatus.message ? (
                      <motion.div
                        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                        className={`mt-5 rounded-md border px-4 py-3 text-sm leading-6 ${statusClasses(
                          bookingStatus.type,
                        )}`}
                      >
                        {bookingStatus.message}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {bookingResult ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {bookingResult.inviteUrl ? (
                        <a
                          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#cfd7e2] bg-white px-4 text-sm font-bold text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb]"
                          href={backendAssetUrl(bookingResult.inviteUrl)}
                        >
                          Download calendar invite
                        </a>
                      ) : null}

                      {bookingResult.meetingLink ? (
                        <a
                          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0f766e] px-4 text-sm font-bold text-white transition duration-200 hover:bg-[#115e59]"
                          href={bookingResult.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open virtual meeting
                        </a>
                      ) : null}
                    </div>
                  ) : null}

                  {availability.error ? (
                    <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                      {availability.error}
                    </div>
                  ) : null}

                  <div className="mt-6 grid gap-5">
                    <div className="grid gap-4 lg:hidden">
                      <div className="overflow-hidden rounded-lg border border-[#dde3ea] bg-white">
                        <div className="flex items-center justify-between gap-3 border-b border-[#dde3ea] bg-[#f8fafc] px-3 py-3 sm:px-4 sm:py-4">
                          <div>
                            <p className="text-xs font-bold uppercase text-[#667085]">Booking calendar</p>
                            <h4 className="mt-1 text-lg font-extrabold text-[#111827] sm:text-xl" style={titleFont}>
                              {activeMonthLabel}
                            </h4>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#cfd7e2] bg-white text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-45"
                              onClick={() => goToCalendarMonth(-1)}
                              disabled={!canGoToPreviousMonth}
                              aria-label="Previous month"
                            >
                              <ArrowIcon direction="left" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#cfd7e2] bg-white text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-45"
                              onClick={() => goToCalendarMonth(1)}
                              disabled={!canGoToNextMonth}
                              aria-label="Next month"
                            >
                              <ArrowIcon />
                            </button>
                          </div>
                        </div>

                        <div className="px-2 pb-3 pt-3 sm:px-4">
                          <div className="grid grid-cols-7 gap-1">
                            {calendarDayLabels.map((label) => (
                              <div
                                key={label}
                                className="pb-1 text-center text-[10px] font-extrabold uppercase text-[#667085]"
                              >
                                {label}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day) => {
                              const isSelectedDate = selectedDateKey === day.key
                              const hasSlots = day.slotCount > 0
                              const isBookedDay = day.availabilityState === 'booked'
                              const isOutsideWindow = day.availabilityState === 'outside-window'
                              const statusBadgeClass = hasSlots
                                ? 'bg-[#0f766e] text-white'
                                : isBookedDay
                                  ? 'bg-red-100 text-red-800'
                                  : isOutsideWindow
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'

                              return (
                                <button
                                  key={day.key}
                                  type="button"
                                  className={`relative min-h-[4.25rem] rounded-md border px-1 py-1.5 text-center transition duration-200 ${hasSlots
                                    ? 'border-[#9cc5ff] bg-[#eff6ff] text-[#111827]'
                                    : isBookedDay
                                      ? 'border-red-200 bg-red-50 text-red-700'
                                      : 'border-[#e5eaf0] bg-[#f8fafc] text-[#98a2b3]'
                                    } ${isSelectedDate ? 'border-[#111827] ring-2 ring-[#111827]/10' : ''} ${!day.inMonth ? 'opacity-45' : ''
                                    }`}
                                  onClick={() => {
                                    if (hasSlots) {
                                      openDateModal(day.key)
                                    } else {
                                      selectDate(day.key)
                                    }
                                  }}
                                  aria-label={`${day.statusLabel}: ${day.statusHint}`}
                                >
                                  <span
                                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md text-xs font-extrabold ${isSelectedDate
                                      ? 'bg-[#111827] text-white'
                                      : day.isToday
                                        ? 'bg-[#dbeafe] text-[#2563eb]'
                                        : 'bg-white text-current'
                                      }`}
                                  >
                                    {day.dayNumber}
                                  </span>
                                  <span className={`mx-auto mt-2 block w-full rounded px-0.5 py-1 text-[9px] font-extrabold uppercase leading-none ${statusBadgeClass}`}>
                                    {day.statusLabel}
                                  </span>
                                </button>
                              )
                            })}
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-[#566070]">
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-sm bg-[#0f766e]" /> Open
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-sm bg-red-200" /> Reserved
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-sm bg-slate-300" /> Closed
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <span className="h-2 w-2 rounded-sm bg-amber-200" /> Later
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#dde3ea] bg-white p-4 sm:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-bold uppercase text-[#667085]">Available times</p>
                            <h4 className="mt-2 text-xl font-extrabold text-[#111827]" style={titleFont}>
                              {selectedDateLabel || 'Select a date'}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex w-fit rounded-md bg-[#e6f4f1] px-3 py-2 text-xs font-extrabold text-[#0f766e]">
                              {selectedDateSlots.length} open
                            </span>
                            {selectedDateReservedSlots.length > 0 ? (
                              <span className="inline-flex w-fit rounded-md bg-red-100 px-3 py-2 text-xs font-extrabold text-red-800">
                                {selectedDateReservedSlots.length} reserved
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-[#566070]">{selectedDaySummary}</p>

                        {selectedDateDisplaySlots.length > 0 ? (
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {selectedDateDisplaySlots.map((slot) => {
                              const isActive = selectedSlot === slot.start
                              const isReserved = slot.status === 'reserved'

                              return (
                                <button
                                  key={slot.start}
                                  type="button"
                                  className={`min-h-14 rounded-md border px-4 py-3 text-left text-sm transition duration-200 ${isReserved
                                    ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-800'
                                    : isActive
                                      ? 'border-[#111827] bg-[#111827] text-white'
                                      : 'border-[#cfd7e2] bg-[#f8fafc] text-[#111827] hover:border-[#2563eb] hover:bg-[#eff6ff]'
                                    }`}
                                  onClick={() => handleSlotChoice(slot)}
                                  disabled={isReserved}
                                >
                                  <span className="block font-extrabold">
                                    {formatSlotTimeRange(slot, availability.timezone)}
                                  </span>
                                  {isReserved ? (
                                    <span className="mt-1 block text-xs font-bold text-red-700">
                                      Already reserved
                                    </span>
                                  ) : null}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-md border border-dashed border-[#b8c2cf] bg-[#f8fafc] px-4 py-5 text-sm leading-6 text-[#566070]">
                            Select a date with open availability to view time slots.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden gap-5 lg:grid lg:grid-cols-[1.28fr_0.82fr]">
                      <div className="overflow-hidden rounded-lg border border-[#dde3ea] bg-white">
                        <div className="flex items-center justify-between border-b border-[#dde3ea] bg-[#f8fafc] px-4 py-4 sm:px-5">
                          <div>
                            <p className="text-xs font-bold uppercase text-[#667085]">Booking calendar</p>
                            <h4 className="mt-1 text-xl font-extrabold text-[#111827]" style={titleFont}>
                              {activeMonthLabel}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#cfd7e2] bg-white text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-45"
                              onClick={() => goToCalendarMonth(-1)}
                              disabled={!canGoToPreviousMonth}
                              aria-label="Previous month"
                            >
                              <ArrowIcon direction="left" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#cfd7e2] bg-white text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb] disabled:cursor-not-allowed disabled:opacity-45"
                              onClick={() => goToCalendarMonth(1)}
                              disabled={!canGoToNextMonth}
                              aria-label="Next month"
                            >
                              <ArrowIcon />
                            </button>
                          </div>
                        </div>

                        <div className="px-4 pb-5 pt-4 sm:px-5">
                          <div className="grid grid-cols-7 gap-2">
                            {calendarDayLabels.map((label) => (
                              <div
                                key={label}
                                className="px-1 pb-1 text-center text-[11px] font-bold uppercase text-[#667085]"
                              >
                                {label}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((day) => {
                              const isSelectedDate = selectedDateKey === day.key
                              const hasSlots = day.slotCount > 0
                              const isBookedDay = day.availabilityState === 'booked'
                              const isOutsideWindow = day.availabilityState === 'outside-window'
                              const statusBadgeClass = hasSlots
                                ? 'bg-[#0f766e] text-white'
                                : isBookedDay
                                  ? 'bg-red-100 text-red-800'
                                  : isOutsideWindow
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-200 text-slate-700'

                              return (
                                <motion.button
                                  key={day.key}
                                  type="button"
                                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                                  className={`relative min-h-[7.2rem] overflow-hidden rounded-md border p-3 text-left transition duration-200 ${hasSlots
                                    ? 'border-[#9cc5ff] bg-[#eff6ff] text-[#111827] hover:border-[#2563eb]'
                                    : isBookedDay
                                      ? 'border-red-200 bg-red-50 text-red-700'
                                      : 'border-[#e5eaf0] bg-[#f8fafc] text-[#98a2b3]'
                                    } ${isSelectedDate ? 'border-[#111827] ring-2 ring-[#111827]/10' : ''} ${!day.inMonth ? 'opacity-45' : ''
                                    }`}
                                  onClick={() => {
                                    if (hasSlots) {
                                      openDateModal(day.key)
                                    } else {
                                      selectDate(day.key)
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div
                                      className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-extrabold ${isSelectedDate
                                        ? 'bg-[#111827] text-white'
                                        : day.isToday
                                          ? 'bg-[#dbeafe] text-[#2563eb]'
                                          : 'bg-white text-current'
                                        }`}
                                    >
                                      {day.dayNumber}
                                    </div>
                                    {hasSlots ? (
                                      <span className="rounded-md bg-white px-2 py-1 text-[11px] font-extrabold text-[#0f766e]">
                                        {day.slotCount}
                                      </span>
                                    ) : null}
                                  </div>

                                  <div className="mt-4">
                                    <div className={`inline-flex rounded-md px-2.5 py-1.5 text-[12px] font-extrabold uppercase ${statusBadgeClass}`}>
                                      {day.statusLabel}
                                    </div>
                                    <div className="mt-2 text-[12px] font-semibold leading-4 text-current">
                                      {day.statusHint}
                                    </div>
                                  </div>

                                  {hasSlots ? (
                                    <div className="absolute inset-x-2 bottom-2 h-1 rounded-sm bg-[#0f766e]" />
                                  ) : null}
                                </motion.button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-[#dde3ea] bg-[#f8fafc] p-5">
                        <p className="text-xs font-bold uppercase text-[#667085]">Selected day</p>
                        <h4 className="mt-2 text-xl font-extrabold text-[#111827]" style={titleFont}>
                          {selectedDateLabel || 'Choose a date'}
                        </h4>
                        <p className="mt-3 text-sm leading-7 text-[#566070]">{selectedDaySummary}</p>

                        {selectedDateDisplaySlots.length > 0 ? (
                          <div className="mt-5 grid max-h-[18rem] gap-2 overflow-y-auto pr-1">
                            {selectedDateDisplaySlots.map((slot) => {
                              const isActive = selectedSlot === slot.start
                              const isReserved = slot.status === 'reserved'

                              return (
                                <button
                                  key={slot.start}
                                  type="button"
                                  className={`rounded-md border px-3 py-2.5 text-left text-sm transition duration-200 ${isReserved
                                    ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-800'
                                    : isActive
                                      ? 'border-[#111827] bg-[#111827] text-white'
                                      : 'border-[#cfd7e2] bg-white text-[#111827] hover:border-[#2563eb] hover:bg-[#eff6ff]'
                                    }`}
                                  onClick={() => handleSlotChoice(slot)}
                                  disabled={isReserved}
                                >
                                  <span className="block font-extrabold">
                                    {formatSlotTimeRange(slot, availability.timezone)}
                                  </span>
                                  {isReserved ? (
                                    <span className="mt-1 block text-xs font-bold text-red-700">
                                      Already reserved
                                    </span>
                                  ) : null}
                                </button>
                              )
                            })}
                          </div>
                        ) : null}

                        <div className="mt-5 grid gap-3 text-sm leading-6 text-[#111827]">
                          <div className="border-t border-[#dde3ea] pt-3">
                            <span className="font-extrabold">{availability.slots.length}</span> free slots in the current window
                          </div>
                          <div className="border-t border-[#dde3ea] pt-3">
                            Working window: <span className="font-extrabold">{availability.workingHours.startLabel}</span> to{' '}
                            <span className="font-extrabold">{availability.workingHours.endLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!availability.loading && availability.slots.length === 0 && !availability.error ? (
                    <div className="mt-5 rounded-md border border-dashed border-[#b8c2cf] bg-white px-4 py-6 text-sm leading-6 text-[#566070]">
                      No free slots were found within {availability.workingHours.daysLabel},{' '}
                      {availability.workingHours.startLabel} to {availability.workingHours.endLabel}.
                      Refresh later or contact us directly.
                    </div>
                  ) : null}

                  <AnimatePresence>
                    {isCalendarModalOpen && selectedDateKey ? (
                      <motion.div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1020]/50 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCalendarModalOpen(false)}
                      >
                        <motion.div
                          className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-white/70 bg-white shadow-[0_30px_90px_rgba(10,14,26,0.26)]"
                          initial={{
                            opacity: 0,
                            y: shouldReduceMotion ? 0 : 24,
                            scale: shouldReduceMotion ? 1 : 0.985,
                          }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{
                            opacity: 0,
                            y: shouldReduceMotion ? 0 : 18,
                            scale: shouldReduceMotion ? 1 : 0.99,
                          }}
                          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="sticky top-0 z-10 border-b border-[#dde3ea] bg-[#f8fafc] px-5 py-5 sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase text-[#667085]">Free slots</p>
                                <h4 className="mt-2 text-xl font-extrabold leading-tight text-[#111827] sm:text-2xl" style={titleFont}>
                                  {selectedDateLabel}
                                </h4>
                                <p className="mt-2 text-sm leading-6 text-[#566070]">
                                  {selectedDateSlots.length > 0
                                    ? 'Choose an open appointment time for this date.'
                                    : selectedDateReservedSlots.length > 0
                                      ? 'All appointment slots for this date are already reserved.'
                                      : 'There are no free appointment slots for this date.'}
                                </p>
                              </div>

                              <button
                                type="button"
                                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-[#cfd7e2] bg-white px-3 text-sm font-extrabold text-[#111827] transition duration-200 hover:border-[#2563eb] hover:text-[#2563eb]"
                                onClick={() => setIsCalendarModalOpen(false)}
                                aria-label="Close slot modal"
                              >
                                <span>Close</span>
                                <CloseIcon />
                              </button>
                            </div>
                          </div>

                          <div className="px-5 py-5 sm:px-6">
                            {selectedDateDisplaySlots.length > 0 ? (
                              <div className="grid gap-3 sm:grid-cols-2">
                                {selectedDateDisplaySlots.map((slot, index) => {
                                  const isActive = selectedSlot === slot.start
                                  const isReserved = slot.status === 'reserved'

                                  return (
                                    <motion.button
                                      key={slot.start}
                                      type="button"
                                      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: shouldReduceMotion ? 0 : index * 0.03 }}
                                      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                                      className={`rounded-md border px-4 py-4 text-left transition duration-200 ${isReserved
                                        ? 'cursor-not-allowed border-red-200 bg-red-50 text-red-800'
                                        : isActive
                                          ? 'border-[#111827] bg-[#111827] text-white shadow-[0_18px_30px_rgba(17,24,39,0.16)]'
                                          : 'border-[#cfd7e2] bg-white text-[#111827] hover:border-[#2563eb] hover:bg-[#eff6ff]'
                                        }`}
                                      onClick={() => handleSlotChoice(slot)}
                                      disabled={isReserved}
                                    >
                                      <div className="text-sm font-extrabold">
                                        {formatSlotTimeRange(slot, availability.timezone)}
                                      </div>
                                      <div className={`mt-2 text-xs font-bold ${isReserved
                                        ? 'text-red-700'
                                        : isActive
                                          ? 'text-white/76'
                                          : 'text-[#667085]'
                                        }`}>
                                        {isReserved ? 'Already reserved' : 'Select this consultation slot'}
                                      </div>
                                    </motion.button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="rounded-md border border-dashed border-[#b8c2cf] bg-[#f8fafc] px-4 py-6 text-sm leading-6 text-[#566070]">
                                This date currently has no free slots. Choose another highlighted day from the calendar.
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <form className="mt-6 grid gap-4" onSubmit={handleBookingSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        type="text"
                        placeholder="Your name"
                        value={bookingForm.name}
                        onChange={(event) =>
                          setBookingForm((current) => ({ ...current, name: event.target.value }))
                        }
                        required
                      />
                      <input
                        className={inputClass}
                        type="email"
                        placeholder="Email address"
                        value={bookingForm.email}
                        onChange={(event) =>
                          setBookingForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        className={inputClass}
                        type="tel"
                        placeholder="Mobile number"
                        value={bookingForm.mobileNumber}
                        onChange={(event) =>
                          setBookingForm((current) => ({
                            ...current,
                            mobileNumber: event.target.value,
                          }))
                        }
                        required
                      />
                      <input
                        className={inputClass}
                        type="text"
                        placeholder="Company name"
                        value={bookingForm.company}
                        onChange={(event) => setBookingForm((current) => ({ ...current, company: event.target.value }))}
                      />
                    </div>

                    <select
                      className={inputClass}
                      value={bookingForm.projectType}
                      onChange={(event) =>
                        setBookingForm((current) => ({
                          ...current,
                          projectType: event.target.value,
                        }))
                      }
                    >
                      {projectTypeOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>

                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                      <select
                        className={inputClass}
                        value={bookingForm.appointmentMode}
                        onChange={(event) =>
                          setBookingForm((current) => ({
                            ...current,
                            appointmentMode: event.target.value,
                          }))
                        }
                      >
                        {availability.appointmentModes.map((mode) => (
                          <option key={mode.value} value={mode.value}>
                            {mode.label}
                          </option>
                        ))}
                      </select>

                      <div className="rounded-md border border-[#dde3ea] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#111827]">
                        <span className="font-extrabold">{chosenAppointmentMode.label}:</span>{' '}
                        {chosenAppointmentMode.description}
                      </div>
                    </div>

                    <textarea
                      className={`${inputClass} min-h-28 resize-y`}
                      placeholder="What should we discuss in the appointment?"
                      value={bookingForm.notes}
                      onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
                    />

                    {chosenSlot ? (
                      <div className="rounded-md border border-[#dde3ea] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#111827]">
                        Selected slot:{' '}
                        <span className="font-extrabold">
                          {formatSlotTimeRange(chosenSlot, availability.timezone)}
                        </span>
                      </div>
                    ) : null}

                    <motion.button
                      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                      className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#0f766e] px-5 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(15,118,110,0.16)] transition duration-200 hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                      disabled={bookingSubmitting || availability.loading || availability.slots.length === 0 || !selectedSlot}
                    >
                      {bookingSubmitting ? 'Booking...' : 'Book consultation'}
                    </motion.button>
                  </form>
                </motion.article>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#dde3ea] bg-white">
          <div className={`${pageWidth} flex flex-col gap-4 py-8 text-sm text-[#566070] sm:flex-row sm:items-center sm:justify-between`}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-[#dde3ea] bg-white">
                <img
                  className="h-8 w-8 object-contain"
                  src="/assets/logo-transparent.png"
                  alt=""
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="font-extrabold text-[#111827]">Fast Infotech Solution</p>
                <p>Software development for web, mobile, desktop, and blockchain products.</p>
              </div>
            </div>
            <span>Copyright {new Date().getFullYear()} Fast Infotech Solution.</span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  )
}

export default App
