<?php

declare(strict_types=1);

final class ApiError extends RuntimeException
{
    public int $status;
    public ?array $availability;

    public function __construct(string $message, int $status = 500, ?array $availability = null)
    {
        parent::__construct($message);
        $this->status = $status;
        $this->availability = $availability;
    }
}

function project_root(): string
{
    return basename(__DIR__) === 'api' ? dirname(__DIR__) : __DIR__;
}

function load_env_file(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#')) {
            continue;
        }

        $separator = strpos($trimmed, '=');
        if ($separator === false) {
            continue;
        }

        $key = trim(substr($trimmed, 0, $separator));
        $value = trim(substr($trimmed, $separator + 1));
        $value = trim($value, "\"'");

        if ($key === '') {
            continue;
        }

        if (getenv($key) === false) {
            putenv($key . '=' . $value);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

function env_value(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value === false || $value === '') {
        return $default;
    }

    return $value;
}

load_env_file(project_root() . DIRECTORY_SEPARATOR . '.env');
load_env_file(__DIR__ . DIRECTORY_SEPARATOR . '.env');

function configured_env_value(string $key, ?string $default = null): ?string
{
    $value = trim((string) (env_value($key, $default) ?? ''));
    if ($value === '' || str_starts_with($value, 'your-') || str_contains($value, 'your-meet-code')) {
        return null;
    }

    return $value;
}

function configured_list_env(string $key): array
{
    $value = configured_env_value($key);
    if ($value === null) {
        return [];
    }

    return array_values(
        array_filter(
            array_map(static fn(string $item): string => rtrim(trim($item), '/'), explode(',', $value)),
            static fn(string $item): bool => $item !== ''
        )
    );
}

function normalize_cors_origin(string $value): ?string
{
    $value = rtrim(trim($value), '/');
    if ($value === '') {
        return null;
    }

    if ($value === '*') {
        return '*';
    }

    $parts = parse_url($value);
    if (!is_array($parts)) {
        return $value;
    }

    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = strtolower((string) ($parts['host'] ?? ''));
    if (!in_array($scheme, ['http', 'https'], true) || $host === '') {
        return $value;
    }

    $port = isset($parts['port']) ? ':' . (int) $parts['port'] : '';
    return $scheme . '://' . $host . $port;
}

function apply_cors_headers(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = configured_list_env('CORS_ALLOWED_ORIGINS');
    $frontendUrl = configured_env_value('FRONTEND_URL');

    if ($frontendUrl !== null) {
        $allowedOrigins[] = rtrim($frontendUrl, '/');
    }

    $allowedOrigins = array_values(
        array_unique(
            array_filter(
                array_map(static fn(string $value): ?string => normalize_cors_origin($value), $allowedOrigins),
                static fn(?string $value): bool => $value !== null
            )
        )
    );

    if (is_string($origin) && $origin !== '') {
        $normalizedOrigin = normalize_cors_origin($origin);
        $allowAnyOrigin = $allowedOrigins === [] || in_array('*', $allowedOrigins, true);

        if ($normalizedOrigin !== null && ($allowAnyOrigin || in_array($normalizedOrigin, $allowedOrigins, true))) {
            header('Access-Control-Allow-Origin: ' . ($allowAnyOrigin ? '*' : $normalizedOrigin));
            header('Vary: Origin');
        }
    } elseif ($allowedOrigins === [] || in_array('*', $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept');
    header('Access-Control-Max-Age: 86400');
}

apply_cors_headers();

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function app_timezone(): DateTimeZone
{
    static $timezone = null;

    if ($timezone instanceof DateTimeZone) {
        return $timezone;
    }

    $timezone = new DateTimeZone(env_value('APPOINTMENT_TIMEZONE', 'Asia/Kolkata') ?? 'Asia/Kolkata');
    return $timezone;
}

function utc_timezone(): DateTimeZone
{
    static $timezone = null;

    if ($timezone instanceof DateTimeZone) {
        return $timezone;
    }

    $timezone = new DateTimeZone('UTC');
    return $timezone;
}

function app_now(): DateTimeImmutable
{
    return new DateTimeImmutable('now', app_timezone());
}

function parse_clock_value(?string $value, string $fallback): array
{
    $normalized = trim((string) ($value ?: $fallback));
    if (!preg_match('/^([01]?\d|2[0-3]):([0-5]\d)$/', $normalized, $matches)) {
        return parse_clock_value($fallback, $fallback);
    }

    return [
        'hour' => (int) $matches[1],
        'minute' => (int) $matches[2],
        'value' => str_pad($matches[1], 2, '0', STR_PAD_LEFT) . ':' . $matches[2],
    ];
}

function slot_start_time(): array
{
    static $clock = null;

    if (is_array($clock)) {
        return $clock;
    }

    $clock = parse_clock_value(env_value('APPOINTMENT_WORKDAY_START', '11:00'), '11:00');
    return $clock;
}

function slot_end_time(): array
{
    static $clock = null;

    if (is_array($clock)) {
        return $clock;
    }

    $clock = parse_clock_value(env_value('APPOINTMENT_WORKDAY_END', '16:30'), '16:30');
    return $clock;
}

function working_days(): array
{
    static $days = null;

    if (is_array($days)) {
        return $days;
    }

    $days = array_values(
        array_filter(
            array_map(
                static fn(string $value): int => (int) trim($value),
                explode(',', env_value('APPOINTMENT_WORKING_DAYS', '1,2,3,4,5') ?? '1,2,3,4,5')
            ),
            static fn(int $value): bool => $value >= 1 && $value <= 7
        )
    );

    return $days;
}

function slot_duration_minutes(): int
{
    return max(5, (int) (env_value('APPOINTMENT_DURATION_MINUTES', '30') ?? '30'));
}

function slot_min_notice_minutes(): int
{
    return max(0, (int) (env_value('APPOINTMENT_MIN_NOTICE_MINUTES', '180') ?? '180'));
}

function slot_window_days(): int
{
    return max(1, (int) (env_value('APPOINTMENT_WINDOW_DAYS', '14') ?? '14'));
}

function slot_buffer_minutes(): int
{
    return max(0, (int) (env_value('APPOINTMENT_BUFFER_MINUTES', '0') ?? '0'));
}

function physical_appointment_location(): string
{
    return env_value('APPOINTMENT_PHYSICAL_LOCATION', 'Fast Infotech Solution office') ?? 'Fast Infotech Solution office';
}

function contact_target_email(): string
{
    return env_value('CONTACT_TARGET_EMAIL', 'gaichrin25@gmail.com') ?? 'gaichrin25@gmail.com';
}

function virtual_meeting_base_url(): string
{
    $baseUrl = configured_env_value('JITSI_BASE_URL') ?? 'https://meet.jit.si';
    $baseUrl = rtrim($baseUrl, '/');
    $parts = parse_url($baseUrl);

    if (!is_array($parts)) {
        return 'https://meet.jit.si';
    }

    $scheme = strtolower((string) ($parts['scheme'] ?? ''));
    $host = trim((string) ($parts['host'] ?? ''));

    if (!in_array($scheme, ['http', 'https'], true) || $host === '') {
        return 'https://meet.jit.si';
    }

    return $baseUrl;
}

function virtual_meeting_room_name(string $appointmentId): string
{
    $roomId = strtolower(preg_replace('/[^A-Za-z0-9]/', '', $appointmentId) ?? '');
    return 'fits-appointment-' . ($roomId !== '' ? $roomId : bin2hex(random_bytes(12)));
}

function build_virtual_meeting_link(string $appointmentId): string
{
    return virtual_meeting_base_url() . '/' . rawurlencode(virtual_meeting_room_name($appointmentId));
}

function mail_sender_email(): string
{
    return configured_env_value('JDCL_SMTP_FROM_EMAIL')
        ?? configured_env_value('SMTP_FROM_EMAIL')
        ?? configured_env_value('MAIL_FROM_EMAIL')
        ?? contact_target_email();
}

function smtp_config(): ?array
{
    $host = configured_env_value('JDCL_SMTP_HOST') ?? configured_env_value('SMTP_HOST');
    if ($host === null) {
        return null;
    }

    $username = configured_env_value('JDCL_SMTP_USERNAME') ?? configured_env_value('SMTP_USERNAME');
    $password = configured_env_value('JDCL_SMTP_PASSWORD') ?? configured_env_value('SMTP_PASSWORD');
    $fromEmail = configured_env_value('JDCL_SMTP_FROM_EMAIL') ?? configured_env_value('SMTP_FROM_EMAIL') ?? $username;

    if (
        $username === null
        || $password === null
        || $fromEmail === null
        || filter_var($fromEmail, FILTER_VALIDATE_EMAIL) === false
    ) {
        return null;
    }

    if (strtolower($host) === 'smtp.gmail.com') {
        $password = preg_replace('/\s+/', '', $password) ?? $password;
    }

    return [
        'host' => $host,
        'port' => (int) (configured_env_value('JDCL_SMTP_PORT') ?? configured_env_value('SMTP_PORT') ?? '587'),
        'username' => $username,
        'password' => $password,
        'encryption' => strtolower(configured_env_value('JDCL_SMTP_ENCRYPTION') ?? configured_env_value('SMTP_ENCRYPTION') ?? 'tls'),
        'fromEmail' => $fromEmail,
        'fromName' => configured_env_value('JDCL_SMTP_FROM_NAME') ?? configured_env_value('SMTP_FROM_NAME') ?? 'Fast Infotech Solution',
    ];
}

function request_scheme(): string
{
    $forwardedProto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '';
    if (is_string($forwardedProto) && trim($forwardedProto) !== '') {
        $proto = strtolower(trim(explode(',', $forwardedProto)[0]));
        if (in_array($proto, ['http', 'https'], true)) {
            return $proto;
        }
    }

    $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
    if ($https !== '' && $https !== 'off') {
        return 'https';
    }

    return ((string) ($_SERVER['SERVER_PORT'] ?? '') === '443') ? 'https' : 'http';
}

function app_base_url(): string
{
    $configuredUrl = configured_env_value('SITE_URL');
    if ($configuredUrl !== null) {
        return rtrim($configuredUrl, '/');
    }

    $host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
    if (is_string($host) && trim($host) !== '') {
        $host = trim(explode(',', $host)[0]);
        return request_scheme() . '://' . $host;
    }

    return '';
}

function absolute_url(string $path): string
{
    $baseUrl = app_base_url();
    return $baseUrl === '' ? $path : $baseUrl . $path;
}

function appointment_db_config(): array
{
    return [
        'host' => env_value('APPOINTMENT_DB_HOST', '127.0.0.1') ?? '127.0.0.1',
        'port' => (int) (env_value('APPOINTMENT_DB_PORT', '3306') ?? '3306'),
        'name' => env_value('APPOINTMENT_DB_NAME', 'fits_appointments') ?? 'fits_appointments',
        'user' => env_value('APPOINTMENT_DB_USER', 'fits_app') ?? 'fits_app',
        'password' => env_value('APPOINTMENT_DB_PASSWORD', '') ?? '',
        'socket' => configured_env_value('APPOINTMENT_DB_SOCKET_PATH') ?? '',
    ];
}

function appointment_db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = appointment_db_config();
    $dsn = is_string($config['socket']) && $config['socket'] !== '' && file_exists($config['socket'])
        ? sprintf('mysql:unix_socket=%s;dbname=%s;charset=utf8mb4', $config['socket'], $config['name'])
        : sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $config['host'], $config['port'], $config['name']);

    $pdo = new PDO(
        $dsn,
        (string) $config['user'],
        (string) $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );

    $pdo->exec("SET time_zone = '+00:00'");
    initialize_appointments_db($pdo);

    return $pdo;
}

function initialize_appointments_db(PDO $pdo): void
{
    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS appointments (
            id CHAR(36) PRIMARY KEY,
            name VARCHAR(160) NOT NULL,
            email VARCHAR(191) NOT NULL,
            company VARCHAR(191) NULL,
            project_type VARCHAR(191) NULL,
            appointment_mode ENUM("physical", "virtual") NOT NULL,
            notes TEXT NULL,
            start_at DATETIME NOT NULL,
            end_at DATETIME NOT NULL,
            location VARCHAR(255) NULL,
            meeting_link VARCHAR(512) NULL,
            google_event_id VARCHAR(255) NULL,
            reminder_email_minutes INT NULL,
            reminder_popup_minutes INT NULL,
            created_at DATETIME NOT NULL,
            UNIQUE KEY uk_appointments_start_at (start_at),
            KEY idx_appointments_time_window (start_at, end_at),
            KEY idx_appointments_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci'
    );

    $config = appointment_db_config();
    $statement = $pdo->prepare(
        'SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = :schema
           AND TABLE_NAME = "appointments"
           AND COLUMN_NAME = "mobile_number"
         LIMIT 1'
    );
    $statement->execute(['schema' => $config['name']]);
    $column = $statement->fetch();

    if ($column === false) {
        $pdo->exec('ALTER TABLE appointments ADD COLUMN mobile_number VARCHAR(32) NULL AFTER email');
    }

    $statement = $pdo->prepare(
        'SELECT COLUMN_NAME
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = :schema
           AND TABLE_NAME = "appointments"
           AND COLUMN_NAME = "google_event_id"
         LIMIT 1'
    );
    $statement->execute(['schema' => $config['name']]);
    $column = $statement->fetch();

    if ($column === false) {
        $pdo->exec('ALTER TABLE appointments ADD COLUMN google_event_id VARCHAR(255) NULL AFTER meeting_link');
    }
}

function to_database_datetime(DateTimeImmutable $dateTime): string
{
    return $dateTime->setTimezone(utc_timezone())->format('Y-m-d H:i:s');
}

function from_database_datetime(string $value): DateTimeImmutable
{
    return new DateTimeImmutable($value, utc_timezone());
}

function format_iso(DateTimeImmutable $dateTime): string
{
    return $dateTime->setTimezone(app_timezone())->format('Y-m-d\TH:i:s.vP');
}

function format_clock_label(array $clock): string
{
    $dateTime = (new DateTimeImmutable('2024-01-01 00:00:00', app_timezone()))
        ->setTime($clock['hour'], $clock['minute']);

    return $dateTime->format('h:i A');
}

function weekday_labels(): array
{
    return [
        1 => 'Monday',
        2 => 'Tuesday',
        3 => 'Wednesday',
        4 => 'Thursday',
        5 => 'Friday',
        6 => 'Saturday',
        7 => 'Sunday',
    ];
}

function format_working_days_label(array $days): string
{
    $days = array_values(array_unique($days));
    sort($days);

    if ($days === [1, 2, 3, 4, 5]) {
        return 'Monday to Friday';
    }

    $labels = array_map(
        static fn(int $day): string => weekday_labels()[$day] ?? ('Day ' . $day),
        $days
    );

    if (count($labels) <= 1) {
        return $labels[0] ?? 'Selected days';
    }

    if (count($labels) === 2) {
        return $labels[0] . ' and ' . $labels[1];
    }

    return implode(', ', array_slice($labels, 0, -1)) . ', and ' . $labels[array_key_last($labels)];
}

function build_working_hours_payload(): array
{
    return [
        'days' => working_days(),
        'daysLabel' => format_working_days_label(working_days()),
        'startValue' => slot_start_time()['value'],
        'endValue' => slot_end_time()['value'],
        'startLabel' => format_clock_label(slot_start_time()),
        'endLabel' => format_clock_label(slot_end_time()),
    ];
}

function build_appointment_modes_payload(): array
{
    return [
        [
            'value' => 'virtual',
            'label' => 'Virtual appointment',
            'description' => 'A Jitsi meeting link and calendar invite will be sent for the confirmed appointment time.',
        ],
        [
            'value' => 'physical',
            'label' => 'Physical appointment',
            'description' => 'Meet at ' . physical_appointment_location() . '.',
        ],
    ];
}

function set_day_clock(DateTimeImmutable $day, array $clock): DateTimeImmutable
{
    return $day->setTime($clock['hour'], $clock['minute'], 0);
}

function is_working_day(DateTimeImmutable $dateTime): bool
{
    return in_array((int) $dateTime->format('N'), working_days(), true);
}

function format_slot_label(DateTimeImmutable $start, DateTimeImmutable $end): string
{
    $localStart = $start->setTimezone(app_timezone());
    $localEnd = $end->setTimezone(app_timezone());

    return sprintf(
        '%s • %s - %s (%s)',
        $localStart->format('D, d M'),
        $localStart->format('h:i A'),
        $localEnd->format('h:i A'),
        app_timezone()->getName()
    );
}

function is_slot_inside_working_window(DateTimeImmutable $start, DateTimeImmutable $end): bool
{
    if ($end <= $start) {
        return false;
    }

    if (!is_working_day($start) || $start->format('Y-m-d') !== $end->format('Y-m-d')) {
        return false;
    }

    $workdayStart = set_day_clock($start, slot_start_time());
    $workdayEnd = set_day_clock($start, slot_end_time());

    return $start >= $workdayStart && $end <= $workdayEnd;
}

function is_slot_bookable(DateTimeImmutable $start, DateTimeImmutable $end): bool
{
    $firstBookableTime = app_now()->add(new DateInterval('PT' . slot_min_notice_minutes() . 'M'));
    $bookingWindowEnd = $firstBookableTime
        ->add(new DateInterval('P' . slot_window_days() . 'D'))
        ->setTime(23, 59, 59);

    return $start >= $firstBookableTime
        && $start <= $bookingWindowEnd
        && is_slot_inside_working_window($start, $end);
}

function list_appointments_between(DateTimeImmutable $timeMin, DateTimeImmutable $timeMax): array
{
    $statement = appointment_db()->prepare(
        'SELECT
            id,
            name,
            email,
            mobile_number AS mobileNumber,
            company,
            project_type AS projectType,
            appointment_mode AS appointmentMode,
            notes,
            start_at AS startAt,
            end_at AS endAt,
            location,
            meeting_link AS meetingLink,
            reminder_email_minutes AS reminderEmailMinutes,
            reminder_popup_minutes AS reminderPopupMinutes,
            created_at AS createdAt
         FROM appointments
         WHERE start_at < :timeMax AND end_at > :timeMin
         ORDER BY start_at ASC'
    );
    $statement->execute([
        'timeMax' => to_database_datetime($timeMax),
        'timeMin' => to_database_datetime($timeMin),
    ]);

    return $statement->fetchAll() ?: [];
}

function get_appointment_by_id(string $appointmentId): ?array
{
    $statement = appointment_db()->prepare(
        'SELECT
            id,
            name,
            email,
            mobile_number AS mobileNumber,
            company,
            project_type AS projectType,
            appointment_mode AS appointmentMode,
            notes,
            start_at AS startAt,
            end_at AS endAt,
            location,
            meeting_link AS meetingLink,
            reminder_email_minutes AS reminderEmailMinutes,
            reminder_popup_minutes AS reminderPopupMinutes,
            created_at AS createdAt
         FROM appointments
         WHERE id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $appointmentId]);
    $row = $statement->fetch();

    return $row === false ? null : $row;
}

function serialize_appointment(?array $record): ?array
{
    if ($record === null) {
        return null;
    }

    $start = from_database_datetime((string) $record['startAt'])->setTimezone(app_timezone());
    $end = from_database_datetime((string) $record['endAt'])->setTimezone(app_timezone());

    return [
        'id' => $record['id'],
        'name' => $record['name'],
        'email' => $record['email'],
        'mobileNumber' => $record['mobileNumber'] ?? null,
        'company' => $record['company'],
        'projectType' => $record['projectType'],
        'appointmentMode' => $record['appointmentMode'],
        'notes' => $record['notes'],
        'location' => $record['location'],
        'meetingLink' => $record['meetingLink'],
        'reminderEmailMinutes' => $record['reminderEmailMinutes'] !== null ? (int) $record['reminderEmailMinutes'] : null,
        'reminderPopupMinutes' => $record['reminderPopupMinutes'] !== null ? (int) $record['reminderPopupMinutes'] : null,
        'createdAt' => format_iso(from_database_datetime((string) $record['createdAt'])),
        'start' => format_iso($start),
        'end' => format_iso($end),
        'slotLabel' => format_slot_label($start, $end),
    ];
}

function normalize_reminder_minutes(int $value): ?int
{
    return $value >= 0 ? $value : null;
}

function create_appointment_record(array $payload): array
{
    $appointmentId = uuid_v4();
    $isVirtual = $payload['appointmentMode'] === 'virtual';
    $meetingLink = $isVirtual ? build_virtual_meeting_link($appointmentId) : null;
    $location = $isVirtual ? null : physical_appointment_location();
    $reminderEmailMinutes = normalize_reminder_minutes((int) (env_value('APPOINTMENT_EMAIL_REMINDER_MINUTES', '60') ?? '60'));
    $reminderPopupMinutes = normalize_reminder_minutes((int) (env_value('APPOINTMENT_POPUP_REMINDER_MINUTES', '15') ?? '15'));
    $createdAt = new DateTimeImmutable('now', utc_timezone());

    $statement = appointment_db()->prepare(
        'INSERT INTO appointments (
            id,
            name,
            email,
            mobile_number,
            company,
            project_type,
            appointment_mode,
            notes,
            start_at,
            end_at,
            location,
            meeting_link,
            google_event_id,
            reminder_email_minutes,
            reminder_popup_minutes,
            created_at
        ) VALUES (
            :id,
            :name,
            :email,
            :mobileNumber,
            :company,
            :projectType,
            :appointmentMode,
            :notes,
            :startAt,
            :endAt,
            :location,
            :meetingLink,
            :externalEventId,
            :reminderEmailMinutes,
            :reminderPopupMinutes,
            :createdAt
        )'
    );

    $statement->execute([
        'id' => $appointmentId,
        'name' => $payload['name'],
        'email' => $payload['email'],
        'mobileNumber' => $payload['mobileNumber'],
        'company' => $payload['company'] ?: null,
        'projectType' => $payload['projectType'] ?: null,
        'appointmentMode' => $payload['appointmentMode'],
        'notes' => $payload['notes'] ?: null,
        'startAt' => to_database_datetime($payload['start']),
        'endAt' => to_database_datetime($payload['end']),
        'location' => $location,
        'meetingLink' => $meetingLink,
        'externalEventId' => null,
        'reminderEmailMinutes' => $reminderEmailMinutes,
        'reminderPopupMinutes' => $reminderPopupMinutes,
        'createdAt' => to_database_datetime($createdAt),
    ]);

    $appointment = get_appointment_by_id($appointmentId);
    $serialized = serialize_appointment($appointment);

    if ($serialized === null) {
        throw new ApiError('Appointment could not be loaded after booking.', 500);
    }

    return $serialized;
}

function get_busy_intervals(DateTimeImmutable $timeMin, DateTimeImmutable $timeMax): array
{
    $appointments = list_appointments_between($timeMin, $timeMax);

    return array_map(
        static function (array $appointment): array {
            return [
                'start' => from_database_datetime((string) $appointment['startAt'])->setTimezone(app_timezone()),
                'end' => from_database_datetime((string) $appointment['endAt'])->setTimezone(app_timezone()),
            ];
        },
        $appointments
    );
}

function overlaps_busy(DateTimeImmutable $slotStart, DateTimeImmutable $slotEnd, array $busyIntervals): bool
{
    foreach ($busyIntervals as $busyInterval) {
        if ($slotStart < $busyInterval['end'] && $slotEnd > $busyInterval['start']) {
            return true;
        }
    }

    return false;
}

function serialize_time_slot(DateTimeImmutable $start, DateTimeImmutable $end, string $status = 'available'): array
{
    return [
        'start' => format_iso($start),
        'end' => format_iso($end),
        'label' => format_slot_label($start, $end),
        'status' => $status,
    ];
}

function build_available_slots(?int $limit = null): array
{
    $effectiveLimit = $limit ?? PHP_INT_MAX;
    $firstBookableTime = app_now()->add(new DateInterval('PT' . slot_min_notice_minutes() . 'M'));
    $rangeStart = $firstBookableTime->setTime(0, 0, 0);
    $rangeEnd = $firstBookableTime
        ->add(new DateInterval('P' . slot_window_days() . 'D'))
        ->setTime(23, 59, 59);

    $busyIntervals = get_busy_intervals($rangeStart, $rangeEnd);
    $slots = [];

    for ($dayOffset = 0; $dayOffset < slot_window_days(); $dayOffset += 1) {
        $day = $rangeStart->add(new DateInterval('P' . $dayOffset . 'D'));
        if (!is_working_day($day)) {
            continue;
        }

        $slotStart = set_day_clock($day, slot_start_time());
        $workdayEnd = set_day_clock($day, slot_end_time());

        while ($slotStart->add(new DateInterval('PT' . slot_duration_minutes() . 'M')) <= $workdayEnd) {
            $slotEnd = $slotStart->add(new DateInterval('PT' . slot_duration_minutes() . 'M'));
            $hasEnoughNotice = $slotStart >= $firstBookableTime;
            $isBusy = overlaps_busy($slotStart, $slotEnd, $busyIntervals);

            if ($hasEnoughNotice && !$isBusy) {
                $slots[] = serialize_time_slot($slotStart, $slotEnd);
            }

            $slotStart = $slotStart->add(
                new DateInterval('PT' . (slot_duration_minutes() + slot_buffer_minutes()) . 'M')
            );

            if (count($slots) >= $effectiveLimit) {
                return $slots;
            }
        }
    }

    return $slots;
}

function build_reserved_slots(): array
{
    $firstBookableTime = app_now()->add(new DateInterval('PT' . slot_min_notice_minutes() . 'M'));
    $rangeStart = $firstBookableTime->setTime(0, 0, 0);
    $rangeEnd = $firstBookableTime
        ->add(new DateInterval('P' . slot_window_days() . 'D'))
        ->setTime(23, 59, 59);

    return array_map(
        static function (array $appointment): array {
            $start = from_database_datetime((string) $appointment['startAt'])->setTimezone(app_timezone());
            $end = from_database_datetime((string) $appointment['endAt'])->setTimezone(app_timezone());
            return serialize_time_slot($start, $end, 'reserved');
        },
        list_appointments_between($rangeStart, $rangeEnd)
    );
}

function build_availability_payload(?array $slots = null): array
{
    $slots = $slots ?? build_available_slots();
    $opensAt = app_now()->add(new DateInterval('PT' . slot_min_notice_minutes() . 'M'));
    $closesAt = $opensAt->add(new DateInterval('P' . slot_window_days() . 'D'))->setTime(23, 59, 59);

    return [
        'provider' => 'mysql',
        'timezone' => app_timezone()->getName(),
        'durationMinutes' => slot_duration_minutes(),
        'bookingWindow' => [
            'opensAt' => format_iso($opensAt),
            'closesAt' => format_iso($closesAt),
            'minNoticeMinutes' => slot_min_notice_minutes(),
            'days' => slot_window_days(),
        ],
        'workingHours' => build_working_hours_payload(),
        'appointmentModes' => build_appointment_modes_payload(),
        'slots' => $slots,
        'reservedSlots' => build_reserved_slots(),
    ];
}

function is_mail_configured(): bool
{
    return filter_var(contact_target_email(), FILTER_VALIDATE_EMAIL) !== false
        && (smtp_config() !== null || function_exists('mail'));
}

function sanitize_email_header(string $value): string
{
    return trim(preg_replace('/[\r\n]+/', ' ', $value) ?? $value);
}

function format_email_address(string $email, string $name = ''): string
{
    $email = sanitize_email_header($email);
    $name = sanitize_email_header($name);

    if ($name === '') {
        return $email;
    }

    return '"' . addcslashes($name, '"\\') . '" <' . $email . '>';
}

function smtp_read_response($connection): array
{
    $response = '';

    while (($line = fgets($connection, 515)) !== false) {
        $response .= $line;
        if (preg_match('/^\d{3}\s/', $line) === 1) {
            break;
        }
    }

    $code = (int) substr($response, 0, 3);
    return [$code, $response];
}

function smtp_command($connection, ?string $command, array $expectedCodes): bool
{
    if ($command !== null) {
        fwrite($connection, $command . "\r\n");
    }

    [$code] = smtp_read_response($connection);
    return in_array($code, $expectedCodes, true);
}

function smtp_send_email_message(
    string $to,
    string $subject,
    string $body,
    ?string $replyTo = null,
    ?string $calendarInvite = null
): bool
{
    $config = smtp_config();
    if ($config === null || filter_var($to, FILTER_VALIDATE_EMAIL) === false) {
        return false;
    }

    $remote = ($config['encryption'] === 'ssl' ? 'ssl://' : '') . $config['host'];
    $connection = @stream_socket_client(
        $remote . ':' . $config['port'],
        $errno,
        $errstr,
        20,
        STREAM_CLIENT_CONNECT
    );

    if ($connection === false) {
        return false;
    }

    stream_set_timeout($connection, 20);
    $serverName = $_SERVER['SERVER_NAME'] ?? 'localhost';

    $ok = smtp_command($connection, null, [220])
        && smtp_command($connection, 'EHLO ' . $serverName, [250]);

    if ($ok && $config['encryption'] === 'tls') {
        $ok = smtp_command($connection, 'STARTTLS', [220]);
        if ($ok) {
            $ok = stream_socket_enable_crypto($connection, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) === true
                && smtp_command($connection, 'EHLO ' . $serverName, [250]);
        }
    }

    $subject = sanitize_email_header($subject);
    $from = format_email_address($config['fromEmail'], $config['fromName']);
    $headers = [
        'MIME-Version: 1.0',
        'From: ' . $from,
        'To: ' . $to,
        'Subject: ' . $subject,
        'Date: ' . date(DATE_RFC2822),
    ];

    if ($replyTo !== null && filter_var($replyTo, FILTER_VALIDATE_EMAIL) !== false) {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    if ($calendarInvite !== null && trim($calendarInvite) !== '') {
        $boundary = 'fits-calendar-' . bin2hex(random_bytes(12));
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
        $messageBody = implode("\r\n", [
            '--' . $boundary,
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            '',
            $body,
            '--' . $boundary,
            'Content-Type: text/calendar; charset=UTF-8; method=REQUEST; name="appointment.ics"',
            'Content-Transfer-Encoding: 8bit',
            'Content-Disposition: inline; filename="appointment.ics"',
            '',
            $calendarInvite,
            '--' . $boundary . '--',
            '',
        ]);
    } else {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: 8bit';
        $messageBody = $body;
    }

    $message = implode("\r\n", $headers) . "\r\n\r\n" . str_replace("\n.", "\n..", str_replace("\r\n", "\n", $messageBody));
    $message = str_replace("\n", "\r\n", $message);

    $ok = $ok
        && smtp_command($connection, 'AUTH LOGIN', [334])
        && smtp_command($connection, base64_encode($config['username']), [334])
        && smtp_command($connection, base64_encode($config['password']), [235])
        && smtp_command($connection, 'MAIL FROM:<' . $config['fromEmail'] . '>', [250])
        && smtp_command($connection, 'RCPT TO:<' . $to . '>', [250, 251])
        && smtp_command($connection, 'DATA', [354])
        && smtp_command($connection, $message . "\r\n.", [250]);

    smtp_command($connection, 'QUIT', [221]);
    fclose($connection);

    return $ok;
}

function send_email_message(
    string $to,
    string $subject,
    string $body,
    ?string $replyTo = null,
    ?string $calendarInvite = null
): bool
{
    if (!is_mail_configured()) {
        return false;
    }

    if (smtp_config() !== null) {
        return smtp_send_email_message($to, $subject, $body, $replyTo, $calendarInvite);
    }

    $headers = [
        'MIME-Version: 1.0',
        'From: ' . format_email_address(mail_sender_email(), 'Fast Infotech Solution'),
    ];

    if ($replyTo !== null && $replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    if ($calendarInvite !== null && trim($calendarInvite) !== '') {
        $boundary = 'fits-calendar-' . bin2hex(random_bytes(12));
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
        $body = implode("\r\n", [
            '--' . $boundary,
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
            '',
            $body,
            '--' . $boundary,
            'Content-Type: text/calendar; charset=UTF-8; method=REQUEST; name="appointment.ics"',
            'Content-Transfer-Encoding: 8bit',
            'Content-Disposition: inline; filename="appointment.ics"',
            '',
            $calendarInvite,
            '--' . $boundary . '--',
            '',
        ]);
    } else {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    }

    return @mail($to, $subject, $body, implode("\r\n", $headers));
}

function build_invite_url(string $appointmentId): string
{
    return '/api/appointments/' . rawurlencode($appointmentId) . '/invite.ics';
}

function escape_ics_text(string $value): string
{
    return str_replace(
        ["\\", "\r\n", "\n", ",", ";"],
        ["\\\\", '\\n', '\\n', '\\,', '\\;'],
        $value
    );
}

function to_ics_utc(DateTimeImmutable $dateTime): string
{
    return $dateTime->setTimezone(utc_timezone())->format('Ymd\THis\Z');
}

function build_reminder_alarms(array $appointment): array
{
    $alarms = [];

    if (is_int($appointment['reminderEmailMinutes']) && $appointment['reminderEmailMinutes'] > 0) {
        $alarms[] = [
            'BEGIN:VALARM',
            'TRIGGER:-PT' . $appointment['reminderEmailMinutes'] . 'M',
            'ACTION:DISPLAY',
            'DESCRIPTION:Appointment reminder',
            'END:VALARM',
        ];
    }

    if (
        is_int($appointment['reminderPopupMinutes'])
        && $appointment['reminderPopupMinutes'] > 0
        && $appointment['reminderPopupMinutes'] !== $appointment['reminderEmailMinutes']
    ) {
        $alarms[] = [
            'BEGIN:VALARM',
            'TRIGGER:-PT' . $appointment['reminderPopupMinutes'] . 'M',
            'ACTION:DISPLAY',
            'DESCRIPTION:Appointment reminder',
            'END:VALARM',
        ];
    }

    return array_merge(...$alarms ?: [[]]);
}

function build_appointment_invite(array $appointment): string
{
    $appointmentTypeLabel = $appointment['appointmentMode'] === 'virtual'
        ? 'Virtual appointment'
        : 'Physical appointment';

    $descriptionParts = [
        'Appointment booked from the Fast Infotech Solution website.',
        '',
        'Appointment type: ' . $appointmentTypeLabel,
        $appointment['meetingLink'] ? 'Jitsi meeting link: ' . $appointment['meetingLink'] : null,
        $appointment['location'] ? 'Location: ' . $appointment['location'] : null,
        $appointment['mobileNumber'] ? 'Contact number: ' . $appointment['mobileNumber'] : null,
        $appointment['projectType'] ? 'Project type: ' . $appointment['projectType'] : null,
        '',
        'Notes:',
        $appointment['notes'] ?: 'No additional notes provided.',
    ];
    $description = implode("\n", array_values(array_filter($descriptionParts, static fn($value): bool => $value !== null)));

    $lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Fast Infotech Solution//Appointments//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        'UID:' . $appointment['id'] . '@fastinfotechsolution.local',
        'DTSTAMP:' . to_ics_utc(new DateTimeImmutable('now', utc_timezone())),
        'DTSTART:' . to_ics_utc(new DateTimeImmutable($appointment['start'], app_timezone())),
        'DTEND:' . to_ics_utc(new DateTimeImmutable($appointment['end'], app_timezone())),
        'SUMMARY:' . escape_ics_text($appointmentTypeLabel . ' with Fast Infotech Solution'),
        'DESCRIPTION:' . escape_ics_text($description),
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'TRANSP:OPAQUE',
        'ORGANIZER;CN=Fast Infotech Solution:MAILTO:' . contact_target_email(),
        'ATTENDEE;CN=' . escape_ics_text($appointment['name']) . ';ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:MAILTO:' . $appointment['email'],
        $appointment['location'] ? 'LOCATION:' . escape_ics_text($appointment['location']) : null,
        $appointment['meetingLink'] ? 'LOCATION:' . escape_ics_text($appointment['meetingLink']) : null,
        $appointment['meetingLink'] ? 'URL:' . escape_ics_text($appointment['meetingLink']) : null,
    ];

    $lines = array_values(array_filter($lines, static fn($value): bool => $value !== null));
    $lines = array_merge($lines, build_reminder_alarms($appointment), ['END:VEVENT', 'END:VCALENDAR']);

    return implode("\r\n", $lines) . "\r\n";
}

function uuid_v4(): string
{
    $bytes = random_bytes(16);
    $bytes[6] = chr((ord($bytes[6]) & 0x0f) | 0x40);
    $bytes[8] = chr((ord($bytes[8]) & 0x3f) | 0x80);

    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($bytes), 4));
}

function read_json_request(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
}

function require_field(array $payload, string $key, string $label): string
{
    $value = trim((string) ($payload[$key] ?? ''));
    if ($value === '') {
        throw new ApiError($label . ' is required.', 400);
    }

    return $value;
}

function require_email(array $payload, string $key = 'email', string $label = 'Email'): string
{
    $value = require_field($payload, $key, $label);
    if (filter_var($value, FILTER_VALIDATE_EMAIL) === false) {
        throw new ApiError('Please enter a valid email.', 400);
    }

    return $value;
}

function require_phone_number(array $payload, string $key = 'mobileNumber', string $label = 'Mobile number'): string
{
    $value = require_field($payload, $key, $label);
    if (!preg_match('/^\+?[0-9()\-\s]{7,24}$/', $value)) {
        throw new ApiError('Please enter a valid mobile number.', 400);
    }

    $digits = preg_replace('/\D+/', '', $value) ?? '';
    if (strlen($digits) < 10 || strlen($digits) > 15) {
        throw new ApiError('Please enter a valid mobile number.', 400);
    }

    return $value;
}

function normalize_appointment_mode(array $payload, string $key = 'appointmentMode'): string
{
    $value = strtolower(trim((string) ($payload[$key] ?? 'virtual')));
    if (!in_array($value, ['virtual', 'physical'], true)) {
        throw new ApiError('Please choose either a virtual or physical appointment.', 400);
    }

    return $value;
}

function request_path(): string
{
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/api', PHP_URL_PATH);
    if (!is_string($uri)) {
        return '/';
    }

    $apiPosition = strpos($uri, '/api');
    if ($apiPosition === false) {
        return $uri;
    }

    $path = substr($uri, $apiPosition + 4);
    return $path === '' ? '/' : $path;
}

function route_request(): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    $path = request_path();

    if ($method === 'GET' && $path === '/health') {
        $config = appointment_db_config();
        json_response([
            'ok' => true,
            'appointmentProvider' => 'mysql',
            'timezone' => app_timezone()->getName(),
            'databaseHost' => $config['host'],
            'databasePort' => $config['port'],
            'databaseName' => $config['name'],
            'databaseSocketPath' => $config['socket'],
            'emailConfigured' => is_mail_configured(),
            'virtualMeetingProvider' => 'jitsi',
            'virtualMeetingBaseUrl' => virtual_meeting_base_url(),
            'contactEmail' => contact_target_email(),
        ]);
        return;
    }

    if ($method === 'GET' && $path === '/availability') {
        json_response(build_availability_payload());
        return;
    }

    if ($method === 'POST' && $path === '/contact') {
        $payload = read_json_request();
        $name = require_field($payload, 'name', 'Name');
        $email = require_email($payload);
        $mobileNumber = require_phone_number($payload);
        $company = trim((string) ($payload['company'] ?? ''));
        $subject = trim((string) ($payload['subject'] ?? '')) ?: 'Website enquiry';
        $message = require_field($payload, 'message', 'Message');

        if (!is_mail_configured()) {
            throw new ApiError('Contact email is not configured on this server yet.', 503);
        }

        $ownerMessage = implode("\n", array_filter([
            'New website contact enquiry',
            '',
            'Name: ' . $name,
            'Email: ' . $email,
            'Mobile number: ' . $mobileNumber,
            $company !== '' ? 'Company: ' . $company : null,
            'Subject: ' . $subject,
            '',
            'Message:',
            $message,
        ]));

        $confirmationMessage = implode("\n", [
            'Hi ' . $name . ',',
            '',
            'Thanks for contacting Fast Infotech Solution.',
            'Your message has been received and will be reviewed shortly.',
            '',
            'Subject: ' . $subject,
            'Mobile number: ' . $mobileNumber,
            '',
            'Fast Infotech Solution',
        ]);

        $ownerSent = send_email_message(contact_target_email(), 'Website enquiry from ' . $name, $ownerMessage, $email);
        $userSent = send_email_message($email, 'We received your message', $confirmationMessage);

        if (!$ownerSent || !$userSent) {
            throw new ApiError('Contact email could not be sent from this server right now.', 503);
        }

        json_response([
            'ok' => true,
            'message' => 'Your message has been sent to ' . contact_target_email() . '.',
        ]);
        return;
    }

    if ($method === 'POST' && $path === '/appointments') {
        $payload = read_json_request();
        $name = require_field($payload, 'name', 'Name');
        $email = require_email($payload);
        $mobileNumber = require_phone_number($payload);
        $company = trim((string) ($payload['company'] ?? ''));
        $projectType = trim((string) ($payload['projectType'] ?? ''));
        $appointmentMode = normalize_appointment_mode($payload);
        $notes = trim((string) ($payload['notes'] ?? ''));
        $startIso = require_field($payload, 'start', 'Selected slot');

        try {
            $start = new DateTimeImmutable($startIso, app_timezone());
        } catch (Exception) {
            throw new ApiError('Selected slot is invalid.', 400);
        }

        $start = $start->setTimezone(app_timezone());
        $end = $start->add(new DateInterval('PT' . slot_duration_minutes() . 'M'));

        if (!is_slot_bookable($start, $end)) {
            throw new ApiError(
                'Please choose a slot within ' . build_working_hours_payload()['daysLabel'] . ', '
                . build_working_hours_payload()['startLabel'] . ' to '
                . build_working_hours_payload()['endLabel'] . '.',
                409,
                build_availability_payload()
            );
        }

        $busyIntervals = get_busy_intervals($start, $end);
        if (overlaps_busy($start, $end, $busyIntervals)) {
            throw new ApiError(
                'That slot is no longer available. Please choose another one.',
                409,
                build_availability_payload()
            );
        }

        try {
            $appointment = create_appointment_record([
                'name' => $name,
                'email' => $email,
                'mobileNumber' => $mobileNumber,
                'company' => $company,
                'projectType' => $projectType,
                'appointmentMode' => $appointmentMode,
                'notes' => $notes,
                'start' => $start,
                'end' => $end,
            ]);
        } catch (PDOException $exception) {
            $message = $exception->getMessage();
            if (str_contains($message, 'Duplicate entry')) {
                throw new ApiError(
                    'That slot was just booked. Please choose another one.',
                    409,
                    build_availability_payload()
                );
            }

            throw $exception;
        }

        $slotLabel = format_slot_label($start, $end);
        $appointmentModeLabel = $appointmentMode === 'virtual' ? 'Virtual appointment' : 'Physical appointment';
        $inviteUrl = build_invite_url($appointment['id']);
        $calendarInvite = build_appointment_invite($appointment);
        $emailNotificationSent = false;

        if (is_mail_configured()) {
            $bookingOwnerMessage = implode("\n", array_filter([
                'New website appointment booked',
                '',
                'Appointment type: ' . $appointmentModeLabel,
                $appointmentMode === 'virtual'
                    ? 'Jitsi meeting link: ' . $appointment['meetingLink']
                    : null,
                $appointmentMode === 'physical'
                    ? 'Location: ' . ($appointment['location'] ?: physical_appointment_location())
                    : null,
                '',
                'Name: ' . $name,
                'Email: ' . $email,
                'Mobile number: ' . $mobileNumber,
                $company !== '' ? 'Company: ' . $company : null,
                $projectType !== '' ? 'Project type: ' . $projectType : null,
                'Time: ' . $slotLabel,
                '',
                'Notes:',
                $notes !== '' ? $notes : 'No additional notes provided.',
                '',
                'Calendar invite: ' . absolute_url($inviteUrl),
            ]));

            $bookingUserMessage = implode("\n", array_filter([
                'Hi ' . $name . ',',
                '',
                'Your appointment with Fast Infotech Solution is confirmed.',
                '',
                'Time: ' . $slotLabel,
                'Appointment type: ' . $appointmentModeLabel,
                'Mobile number: ' . $mobileNumber,
                $appointmentMode === 'virtual'
                    ? 'Jitsi meeting link: ' . $appointment['meetingLink']
                    : null,
                $appointmentMode === 'physical'
                    ? 'Location: ' . ($appointment['location'] ?: physical_appointment_location())
                    : null,
                $projectType !== '' ? 'Project type: ' . $projectType : null,
                '',
                'A calendar invite for this fixed appointment time is included with this email.',
                'Calendar invite: ' . absolute_url($inviteUrl),
                '',
                'Fast Infotech Solution',
            ]));

            $ownerSent = send_email_message(
                contact_target_email(),
                'Appointment booked by ' . $name,
                $bookingOwnerMessage,
                $email,
                $calendarInvite
            );
            $userSent = send_email_message(
                $email,
                'Your appointment is confirmed',
                $bookingUserMessage,
                null,
                $calendarInvite
            );
            $emailNotificationSent = $ownerSent && $userSent;
        }

        json_response([
            'ok' => true,
            'message' => $emailNotificationSent
                ? 'Your appointment is fixed for ' . $slotLabel . '. A confirmation email has been sent to ' . $email . '.'
                : 'Your appointment is fixed for ' . $slotLabel . '. It has been saved in our booking calendar.',
            'appointmentId' => $appointment['id'],
            'appointmentMode' => $appointmentMode,
            'emailNotificationSent' => $emailNotificationSent,
            'location' => $appointment['location'],
            'meetingLink' => $appointment['meetingLink'],
            'inviteUrl' => absolute_url($inviteUrl),
            'slotLabel' => $slotLabel,
        ]);
        return;
    }

    if ($method === 'GET' && preg_match('#^/appointments/([^/]+)/invite\.ics$#', $path, $matches) === 1) {
        $appointmentId = rawurldecode($matches[1]);
        $appointment = serialize_appointment(get_appointment_by_id($appointmentId));

        if ($appointment === null) {
            throw new ApiError('Appointment not found.', 404);
        }

        http_response_code(200);
        header('Content-Type: text/calendar; charset=utf-8');
        header('Content-Disposition: attachment; filename="appointment-' . $appointment['id'] . '.ics"');
        echo build_appointment_invite($appointment);
        return;
    }

    throw new ApiError('Route not found.', 404);
}

try {
    route_request();
} catch (ApiError $error) {
    json_response([
        'ok' => false,
        'message' => $error->getMessage(),
        'availability' => $error->availability,
        'details' => $error->getMessage(),
    ], $error->status);
} catch (Throwable $error) {
    json_response([
        'ok' => false,
        'message' => 'Something went wrong while handling your request.',
        'availability' => null,
        'details' => $error->getMessage(),
    ], 500);
}
