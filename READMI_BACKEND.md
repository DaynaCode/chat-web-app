# 📄 مستندات کامل پروژه پیام‌رسان داخلی

**تاریخ:** 30 اردیبهشت 1405  
**نسخه:** 1.5 
**مخاطب:** تیم DevOps، توسعه‌دهندگان Frontend، AI assistants  

---

## 📋 فهرست مطالب

1. [معرفی پروژه](#1-معرفی-پروژه)
2. [پشته فناوری](#2-پشته-فناوری)
3. [ساختار پروژه](#3-ساختار-پروژه)
4. [راهنمای توسعه محلی (Local Development)](#4-راهنمای-توسعه-محلی)
5. [راهنمای استقرار با Docker (Production)](#5-راهنمای-استقرار-با-docker)
6. [متغیرهای محیطی](#6-متغیرهای-محیطی)
7. [API Reference (REST)](#7-api-reference-rest)
8. [WebSocket Events](#8-websocket-events)
9. [مدل‌های داده](#9-مدل‌های-داده)
10. [احراز هویت (Authentication)](#10-احراز-هویت)
11. [رمزنگاری پیام‌ها](#11-رمزنگاری-پیام‌ها)
12. [قابلیت‌های سیستم](#12-قابلیت‌های-سیستم)
13. [تست‌ها](#13-تست‌ها)
14. [پشتیبان‌گیری و بازیابی](#14-پشتیبان‌گیری-و-بازیابی)
15. [راهنمای اتصال Frontend](#15-راهنمای-اتصال-frontend)
16. [نکات امنیتی](#16-نکات-امنیتی)
17. [عیب‌یابی رایج](#17-عیب‌یابی-رایج)

---

## 1. معرفی پروژه

**سامانه پیام‌رسان داخلی** یک برنامه تحت وب برای ارتباط متنی و تصویری (کم‌حجم) درون سازمانی است.  
ویژگی‌های اصلی:
- چت خصوصی (دو نفره)
- چت گروهی (حداکثر ۵۰ عضو)
- ارسال تصویر (JPG/PNG تا ۲MB)
- وضعیت آنلاین/آفلاین
- نوتیفیکیشن (Desktop Notification)
- پین پیام، میوت، علاقه‌مندی، ریپلای، منشن
- جستجو در پیام‌ها
- رمزنگاری پیام‌ها در دیتابیس
- پنل مدیریت کاربران (ایجاد، ویرایش، فعال/غیرفعال‌سازی، ریست رمز)

---

## 2. پشته فناوری

| لایه | فناوری |
|------|--------|
| Backend Framework | Django 4.2.x |
| API Framework | Django REST Framework 3.14.x |
| Real-time | Django Channels 4.x + Daphne 4.x |
| WebSocket Server | Daphne |
| WSGI Server (Prod) | Gunicorn 21.x |
| Database | PostgreSQL 14 |
| Cache / Channel Layer | Redis 7 |
| Authentication | JWT (djangorestframework-simplejwt) با کوکی |
| File Validation | filetype (بدون نیاز به libmagic) |
| Image Processing | Pillow |
| API Documentation | drf-spectacular (Swagger) |
| Static Files (Prod) | WhiteNoise |
| Message Encryption | cryptography.fernet (Fernet) |
| Containerization | Docker + Docker Compose |

---

## 3. ساختار پروژه

```
messaging-backend/
├── apps/
│   ├── accounts/               # مدیریت کاربران و احراز هویت
│   │   ├── models.py           # User(AbstractUser), Profile
│   │   ├── serializers.py      # UserSerializer, ProfileSerializer, LoginInputSerializer
│   │   ├── permissions.py      # IsAdminUser
│   │   ├── throttles.py        # AdminRateThrottle
│   │   ├── authentication.py   # CookieOrHeaderJWTAuthentication
│   │   ├── tokens.py           # RefreshToken سفارشی (با claimهای camelCase)
│   │   ├── views.py            # Auth views, UserViewSet, PublicUserViewSet, ProfileView
│   │   └── urls.py
│   ├── messaging/              # هسته پیام‌رسان
│   │   ├── models.py           # Conversation, Message, Group, Favorite, Pin, Mute, ReadReceipt
│   │   ├── serializers.py      # ConversationSerializer, MessageSerializer, GroupSerializer
│   │   ├── services.py         # ConversationService, MessageService, GroupService
│   │   ├── consumers.py        # ChatConsumer (WebSocket)
│   │   ├── status_consumer.py  # StatusConsumer (آنلاین بودن)
│   │   ├── status_service.py   # UserStatusManager
│   │   ├── middleware.py       # QueryStringJWTAuthMiddleware
│   │   ├── routing.py          # WebSocket URL patterns
│   │   └── urls.py
│   ├── files/                  # مدیریت آپلود
│   │   ├── models.py           # UploadedFile
│   │   ├── services.py         # FileService (اعتبارسنجی و ذخیره)
│   │   ├── views.py            # FileUploadView
│   │   └── urls.py
│   ├── common/                 # ابزارهای مشترک
│   │   ├── messages.py         # ترجمه پیام‌های خطا (فارسی/انگلیسی)
│   │   ├── handlers.py         # exception handler سفارشی
│   │   ├── middleware.py       # SetNewAccessTokenMiddleware, ApiRedirectMiddleware, SwaggerAnonymousMiddleware
│   │   └── parsers.py          # FlexibleCamelCaseJSONParser (تبدیل camelCase به snake_case)
│   └── webclient/              # فرانت تستی ساده
│       ├── templates/webclient/index.html
│       └── ...
├── config/                     # تنظیمات Django
│   ├── settings/
│   │   ├── base.py             # تنظیمات مشترک
│   │   ├── dev.py              # تنظیمات توسعه
│   │   └── prod.py             # تنظیمات production
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── requirements/
│   ├── base.txt                # نیازمندی‌های اصلی
│   └── dev.txt                 # نیازمندی‌های توسعه
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh               # اسکریپت راه‌اندازی Docker
├── .env.example                # نمونه فایل متغیرهای محیطی
├── .gitignore
├── backup.sh                   # اسکریپت پشتیبان‌گیری
├── restore.sh                  # اسکریپت بازیابی
├── conftest.py                 # تنظیمات pytest
├── manage.py
└── README.md                   # همین مستند
```

---

## 4. راهنمای توسعه محلی

### 4.1 پیش‌نیازها
- Python 3.11+
- PostgreSQL 14
- Redis 7

### 4.2 راه‌اندازی

```bash
git clone <repo>
cd messaging-backend

# ایجاد و فعال‌سازی محیط مجازی
python3 -m venv venv
source venv/bin/activate

# نصب نیازمندی‌ها
pip install -r requirements/dev.txt

# تنظیم متغیر محیطی
export DJANGO_SETTINGS_MODULE=config.settings.dev

# اجرای migration
python manage.py migrate

# ساخت سوپریوزر
python manage.py createsuperuser --username admin --email admin@example.com

# اجرای سرور (HTTP + WebSocket با Daphne)
daphne -p 8000 config.asgi:application
```

برای استفاده از SQLite در توسعه، فایل `dev.py` را طوری تنظیم کن که از SQLite استفاده کند.  
برای WebSocket در توسعه، `CHANNEL_LAYERS` با `InMemoryChannelLayer` تنظیم شود (در `dev.py`).

---

## 5. راهنمای استقرار با Docker

### 5.1 فایل `.env`

مقادیر زیر را در فایل `.env` در ریشه پروژه قرار دهید (می‌توانید از `.env.example` کپی بگیرید):

```bash
DEBUG=False
ALLOWED_HOSTS=your-domain.com,127.0.0.1
DB_NAME=messenger
DB_USER=postgres
DB_PASSWORD=your_strong_password
DB_HOST=db
DB_PORT=5432
REDIS_HOST=redis
FIELD_ENCRYPTION_KEY=your_fernet_key_here
SECRET_KEY=your_django_secret_key
AUTH_COOKIE_SECURE=False   # در صورت استفاده از HTTPS روی True تنظیم شود
CORS_ALLOWED_ORIGINS=http://your-domain.com,http://localhost
CSRF_TRUSTED_ORIGINS=http://your-domain.com,http://localhost
```

### 🔐 تولید کلیدهای امنیتی

#### تولید `FIELD_ENCRYPTION_KEY`

این کلید برای رمزنگاری پیام‌ها استفاده می‌شود و باید یک کلید معتبر **Fernet** باشد.  
برای تولید آن، ابتدا مطمئن شوید کتابخانه `cryptography` نصب است (در `requirements/base.txt` وجود دارد)، سپس دستور زیر را در ترمینال اجرا کنید:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

خروجی یک رشته شبیه به `aE7qY0...` خواهد بود. این رشته را در فایل `.env` در مقابل `FIELD_ENCRYPTION_KEY` قرار دهید.

#### تولید `SECRET_KEY`

کلید محرمانه Django برای امضای کوکی‌ها، CSRF و سایر مسائل امنیتی استفاده می‌شود.  
می‌توانید با دستور زیر یک کلید تصادفی امن تولید کنید:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

خروجی را در فایل `.env` مقابل `SECRET_KEY` قرار دهید.

### 5.2 اجرا

```bash
docker compose up -d --build
```

این دستور ۴ سرویس را اجرا می‌کند:
- `db` (PostgreSQL روی پورت ۵۴۳۳ میزبان)
- `redis` (Redis روی پورت ۶۳۸۰ میزبان)
- `web` (Gunicorn روی پورت ۸۰۰۰)
- `daphne` (Daphne روی پورت ۸۰۰۱ برای WebSocket)

### 5.3 ساخت سوپریوزر

سوپریوزر به‌طور خودکار توسط `entrypoint.sh` با نام کاربری `admin` و رمز `admin123` ساخته می‌شود.  
برای تغییر رمز سوپریوزر از دستور زیر استفاده کنید:

```bash
docker compose exec web python manage.py changepassword admin
```

### 5.4 توقف و راه‌اندازی مجدد

```bash
docker compose down          # توقف و حذف کانتینرها (داده‌ها حفظ می‌شوند)
docker compose up -d         # راه‌اندازی مجدد بدون rebuild
docker compose up -d --build # ساخت مجدد ایمیج در صورت تغییر کد
```

---

## 6. متغیرهای محیطی

| متغیر | توضیح | پیش‌فرض |
|-------|-------|---------|
| `DEBUG` | حالت اشکال‌زدایی (`True`/`False`) | `False` |
| `ALLOWED_HOSTS` | میزبان‌های مجاز (کاما جدا) | `localhost,127.0.0.1` |
| `DB_NAME` | نام دیتابیس | `messenger` |
| `DB_USER` | کاربر PostgreSQL | `postgres` |
| `DB_PASSWORD` | رمز PostgreSQL | (خالی) |
| `DB_HOST` | میزبان PostgreSQL | `db` |
| `DB_PORT` | پورت PostgreSQL | `5432` |
| `REDIS_HOST` | میزبان Redis | `redis` |
| `FIELD_ENCRYPTION_KEY` | کلید رمزنگاری پیام‌ها (Fernet) | (اجباری) |
| `SECRET_KEY` | کلید محرمانه Django | (اجباری) |
| `AUTH_COOKIE_SECURE` | کوکی‌های احراز فقط روی HTTPS | `False` |
| `CORS_ALLOWED_ORIGINS` | آدرس‌های مجاز CORS | `http://localhost` |
| `CSRF_TRUSTED_ORIGINS` | آدرس‌های مجاز CSRF | `http://localhost` |

---

## 7. API Reference (REST)

تمامی endpointها با پیشوند `/api/` هستند.  
پاسخ‌ها به‌طور پیش‌فرض با `CamelCaseJSONRenderer` به camelCase تبدیل می‌شوند.  
درخواست‌ها نیز می‌توانند camelCase باشند (توسط `FlexibleCamelCaseJSONParser`).  
در حالت production، کوکی‌های `access_token` و `refresh_token` به‌طور خودکار مدیریت می‌شوند.  
در حالت توسعه، هدر `Authorization: Bearer <access_token>` الزامی است.

### 7.1 احراز هویت

| Method | Endpoint | Body | پاسخ | توضیح |
|--------|----------|------|------|-------|
| POST | `/api/auth/login/` | `{"username": "...", "password": "..."}` | `{"detail": "Login successful.", "faMessage": "با موفقیت وارد شدید.", "access": "...", "refresh": "..."}` + Set-Cookie | ورود |
| POST | `/api/auth/logout/` | `{"refresh": "..."}` (اختیاری) | `{"detail": "Successfully logged out."}` | خروج (blacklist توکن) |
| POST | `/api/auth/refresh/` | `{"refresh": "..."}` | `{"access": "..."}` + Set-Cookie | رفرش توکن |
| GET | `/api/auth/me/` | - | `{"id": 1, "username": "...", "isActive": true, "isStaff": false, "displayName": "..."}` | اطلاعات کاربر فعلی |

### 7.2 کاربران (Admin)

تمام endpointهای این بخش نیاز به احراز هویت **Admin** (`is_staff=True`) دارند.

| Method | Endpoint | Body/Params | پاسخ | توضیح |
|--------|----------|-------------|------|-------|
| GET | `/api/users/` | - | لیست کاربران | لیست تمام کاربران |
| POST | `/api/users/` | `{"username": "...", "password": "...", "isActive": true}` | `{...}` | ایجاد کاربر |
| GET | `/api/users/{id}/` | - | `{...}` | جزئیات کاربر |
| PATCH | `/api/users/{id}/` | `{"isActive": false, "password": "new"}` | `{...}` | ویرایش کاربر |
| DELETE | `/api/users/{id}/` | - | `204 No Content` | غیرفعال‌سازی (Soft Delete) |
| POST | `/api/users/{id}/activate/` | - | `{...}` | فعال‌سازی |
| POST | `/api/users/{id}/deactivate/` | - | `{...}` | غیرفعال‌سازی |
| POST | `/api/users/{id}/reset_password/` | `{"newPassword": "..."}` | `{"detail": "Password reset successful."}` | ریست رمز |

### 7.3 لیست عمومی کاربران

برای جستجوی کاربران در فرانت.

| Method | Endpoint | توضیح |
|--------|----------|-------|
| GET | `/api/public-users/` | لیست کاربران فعال (بدون صفحه‌بندی) – شامل `id`, `username`, `displayName` |

### 7.4 مکالمات

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| GET | `/api/conversations/` | - | لیست مکالمات کاربر (مرتب‌شده بر اساس آخرین پیام) |
| POST | `/api/conversations/` | `{"type": "private", "userId": 2}` | ایجاد چت خصوصی (در صورت وجود همان را برمی‌گرداند) |
| GET | `/api/conversations/{id}/` | - | جزئیات یک مکالمه |
| GET | `/api/conversations/{id}/search/?q=...` | - | جستجوی پیام در مکالمه |

### 7.5 پیام‌ها

| Method | Endpoint | Body/Params | توضیح |
|--------|----------|-------------|-------|
| GET | `/api/conversations/{id}/messages/?limit=20&cursor=<messageId>` | - | لیست پیام‌ها (Cursor Pagination) |
| POST | `/api/conversations/{id}/messages/` | `{"text": "...", "imageId": null, "repliedToId": null}` | ارسال پیام جدید |
| GET | `/api/messages/{id}/` | - | دریافت یک پیام |
| PATCH | `/api/messages/{id}/` | `{"text": "new text"}` | ویرایش پیام (فقط نویسنده) |
| DELETE | `/api/messages/{id}/` | - | حذف نرم (نویسنده یا Admin) |

### 7.6 گروه‌ها

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| GET | `/api/groups/` | - | لیست گروه‌های کاربر |
| POST | `/api/groups/` | `{"name": "..."}` | ایجاد گروه |
| GET | `/api/groups/{id}/` | - | جزئیات گروه |
| PATCH | `/api/groups/{id}/` | `{"name": "...", "description": "...", "groupImage": <file>}` | ویرایش گروه (مالک) – multipart |
| DELETE | `/api/groups/{id}/` | - | حذف گروه (مالک) |
| POST | `/api/groups/{id}/add_member/` | `{"userId": 3}` | افزودن عضو (مالک) |
| DELETE | `/api/groups/{id}/remove_member/{userId}/` | - | حذف عضو (مالک) |

### 7.7 علاقه‌مندی‌ها (Favorites)

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| GET | `/api/favorites/` | - | لیست علاقه‌مندی‌ها |
| POST | `/api/favorites/` | `{"conversationId": 1}` | افزودن به علاقه‌مندی‌ها |
| DELETE | `/api/favorites/{id}/` | - | حذف از علاقه‌مندی‌ها |

### 7.8 پین پیام

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| GET | `/api/conversations/{id}/pins/` | - | لیست پیام‌های پین‌شده |
| POST | `/api/conversations/{id}/pins/` | `{"messageId": 5}` | پین کردن پیام |
| DELETE | `/api/conversations/{id}/pins/{pinId}/` | - | برداشتن پین |

### 7.9 میوت

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| POST | `/api/mutes/` | `{"conversationId": 1}` | میوت کردن مکالمه |
| DELETE | `/api/mutes/{id}/` | - | برداشتن میوت |

### 7.10 وضعیت خوانده‌شدن

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| POST | `/api/read-receipts/` | `{"messageIds": [1,2,3]}` | علامت‌گذاری پیام‌ها به‌عنوان خوانده‌شده |

### 7.11 پروفایل کاربر

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| GET | `/api/profile/` | - | دریافت پروفایل (ایجاد خودکار) |
| PATCH | `/api/profile/` | `{"displayName": "...", "bio": "...", "avatar": <file>}` | ویرایش پروفایل (multipart) |

### 7.12 آپلود فایل

| Method | Endpoint | Body | توضیح |
|--------|----------|------|-------|
| POST | `/api/upload/` | `{"file": <file>}` (multipart) | آپلود تصویر (jpg/png, max 2MB) |

---

## 8. WebSocket Events

### 8.1 اتصال

- **Chat WS:** `ws://<host>:8001/ws/chat/?token=<access_token>`
- **Status WS:** `ws://<host>:8001/ws/status/?token=<access_token>`

### 8.2 ارسال پیام (Client → Server)

```json
{
  "type": "send_message",
  "conversationId": 1,
  "text": "Hello!",
  "imageId": null,
  "repliedToId": null,
  "clientMessageId": "uuid-123"
}
```

### 8.3 دریافت پیام جدید (Server → Client)

```json
{
  "type": "new_message",
  "message": {
    "id": 1,
    "conversationId": 1,
    "sender": {"id": 1, "username": "admin"},
    "text": "Hello!",
    "image": null,
    "createdAt": "2026-05-14T10:30:00Z",
    "clientMessageId": "uuid-123"
  }
}
```

### 8.4 منشن (Server → Client)

```json
{
  "type": "mention",
  "message": {
    "id": 2,
    "conversationId": 1,
    "sender": "admin",
    "text": "@ali check this",
    "createdAt": "..."
  }
}
```

### 8.5 وضعیت آنلاین (Server → Client)

```json
{
  "type": "user_status",
  "userId": 2,
  "status": "online"
}
```

### 8.6 تیک خواندن (Server → Sender)

```json
{
  "type": "read_receipt",
  "messageIds": [1, 2, 3],
  "readerId": 2
}
```

---

## 9. مدل‌های داده

### 9.1 User (AbstractUser)
- فیلدهای پیش‌فرض Django: `username`, `password`, `is_active`, `is_staff`, `date_joined`, ...
- پروفایل مرتبط: `display_name`, `bio`, `avatar`

### 9.2 Conversation
- `type`: private / group
- `participants`: ManyToMany (از طریق ConversationMembership)
- `created_at`

### 9.3 Message
- `conversation` (FK)
- `sender` (FK)
- `_text` (متن رمزنگاری‌شده)
- `image` (FK به UploadedFile)
- `replied_to` (FK به خود)
- `created_at`, `edited_at`, `is_deleted`

### 9.4 Group
- `conversation` (OneToOne)
- `name`, `description`, `group_image`
- `owner` (FK)
- `max_members` (default 50)

### 9.5 ReadReceipt
- `message` + `user` (unique)

### 9.6 Favorite, PinnedMessage, Mute
- مدل‌های ساده ManyToMany با فیلدهای اضافی.

---

## 10. احراز هویت

- **JWT** با دو توکن: `access_token` (عمر ۱۵ دقیقه) و `refresh_token` (عمر ۷ روز).
- **Claimهای سفارشی:** توکن شامل `isStaff` (camelCase) برای تشخیص ادمین در فرانت است.
- در **Production**، توکن‌ها در کوکی‌های `httpOnly` به نام‌های `access_token` و `refresh_token` ذخیره می‌شوند.
- Middleware سفارشی (`SetNewAccessTokenMiddleware`) در صورت منقضی شدن `access_token`، به‌طور خودکار یک توکن جدید با استفاده از `refresh_token` صادر می‌کند (بدون نیاز به دخالت فرانت).
- برای **توسعه** می‌توانید هدر `Authorization: Bearer <access_token>` ارسال کنید.
- در WebSocket، توکن از طریق query string (`?token=...`) ارسال می‌شود.

---

## 11. رمزنگاری پیام‌ها

- تمام متن‌های پیام‌ها با **Fernet (AES-128-CBC + HMAC)** از کتابخانه `cryptography` رمزنگاری می‌شوند.
- کلید رمزنگاری (`FIELD_ENCRYPTION_KEY`) در فایل `.env` نگهداری می‌شود و نباید فاش شود.
- جستجوی پیام‌ها به دلیل رمزنگاری، در سمت برنامه (Python) انجام می‌شود (نه SQL `LIKE`).

---

## 12. قابلیت‌های سیستم

- **چت خصوصی:** ایجاد مکالمه با یک کاربر دیگر (در صورت وجود همان مکالمه برگردانده می‌شود).
- **چت گروهی:** ایجاد گروه، افزودن/حذف عضو توسط مالک، محدودیت ۵۰ عضو.
- **ویرایش/حذف پیام:** نویسنده می‌تواند ویرایش کند، نویسنده یا Admin می‌توانند حذف نرم کنند.
- **ریپلای:** پاسخ به یک پیام خاص.
- **منشن:** نوشتن `@username` در متن، یک رویداد WebSocket برای کاربر منشن‌شده ارسال می‌کند.
- **پین پیام:** پین کردن پیام‌های مهم در هر مکالمه.
- **میوت:** بی‌صدا کردن اعلان‌های یک مکالمه.
- **علاقه‌مندی:** ذخیره مکالمات مهم.
- **جستجو:** جستجوی متن در پیام‌های یک مکالمه.
- **وضعیت آنلاین:** نمایش لحظه‌ای آنلاین/آفلاین کاربران.
- **Read Receipt:** علامت‌گذاری پیام‌ها به‌عنوان خوانده‌شده و اعلام به فرستنده.
- **آپلود تصویر:** محدود به JPG/PNG و حجم ۲MB.
- **پروفایل کاربر:** نام نمایشی، بیوگرافی، آواتار.
- **پنل مدیریت:** ایجاد، ویرایش، فعال/غیرفعال‌سازی، ریست رمز کاربران (فقط Admin).

---

## 13. تست‌ها

- **تست‌های E2E:** ۶۱ تست جامع که تمام سناریوهای REST و WebSocket را پوشش می‌دهند.
- **اجرا:**
  ```bash
  pytest apps/tests_e2e.py -v
  ```
- برای تست‌های async از `pytest-asyncio` و `pytest-django` استفاده می‌شود.
- تنظیمات تست در `conftest.py` (بارگذاری `.env` با `python-dotenv`).
- دیتابیس تست به‌طور خودکار ساخته و پس از تست حذف می‌شود.

---

## 14. پشتیبان‌گیری و بازیابی

### 14.1 پشتیبان‌گیری

اسکریپت `backup.sh`:

```bash
./backup.sh
```

این اسکریپت:
- یک dump از دیتابیس (`backups/db_<date>.sql`) تهیه می‌کند.
- فایل‌های media را فشرده می‌کند (`backups/media_<date>.tar.gz`).
- از Redis (در صورت وجود) با `BGSAVE` کپی می‌گیرد.
- بکاپ‌های قدیمی‌تر از ۳۰ روز را حذف می‌کند.

### 14.2 بازیابی دیتابیس

```bash
./restore.sh backups/db_20260514_120000.sql
```

برای media کافی است فایل `tar.gz` را استخراج کنید.

---

## 15. راهنمای اتصال Frontend

### 15.1 تنظیمات اولیه

- **Base URL:** `http://<server>:8000/api/`
- **WebSocket Chat:** `ws://<server>:8001/ws/chat/`
- **WebSocket Status:** `ws://<server>:8001/ws/status/`

### 15.2 گردش کار

1. **ورود:** `POST /api/auth/login/` → دریافت `access`، `refresh`، `isStaff` و اطلاعات کاربر.  
2. **تمامی درخواست‌های بعدی:** ارسال هدر `Authorization: Bearer <access>` (یا اتکا به کوکی در صورت استفاده از مرورگر).  
3. **در صورت ۴۰۱:** استفاده از `POST /api/auth/refresh/` با `refresh` که از لاگین گرفته شده.  
4. **اتصال WebSocket:** بلافاصله پس از ورود، باز کردن اتصال به `ws://<host>:8001/ws/chat/?token=<access>` و `ws://<host>:8001/ws/status/?token=<access>`.  
   - گوش دادن به رویدادهای `new_message`، `mention`، `read_receipt` و `user_status`.  
5. **لیست مکالمات:** `GET /api/conversations/`  
6. **باز کردن یک مکالمه:** `GET /api/conversations/{id}/messages/?limit=20`  
7. **ارسال پیام:** `POST /api/conversations/{id}/messages/` (با body شامل `text` و در صورت نیاز `repliedToId`) یا ارسال event `send_message` از طریق WebSocket.  
8. **دریافت پیام‌های جدید:** از طریق WebSocket (`new_message`) – پیام‌ها به‌صورت خودکار به UI اضافه می‌شوند.  
9. **وضعیت آنلاین:** با WebSocket status، کاربران آنلاین/آفلاین به‌صورت لحظه‌ای قابل تشخیص هستند.  

### 15.3 نکات camelCase

- تمام کلیدهای JSON در **پاسخ‌ها** به‌صورت camelCase هستند (مثلاً `isActive`, `conversationId`).  
- **درخواست‌ها** هم می‌توانند camelCase باشند (مثلاً `userName` به `username` تبدیل می‌شود).  
- توکن JWT حاوی claim `isStaff` (camelCase) است.  

### 15.4 مدیریت خطاها

- پاسخ‌ها شامل `detail` (انگلیسی) و `faMessage` (فارسی) هستند.  
- خطاهای اعتبارسنجی ۴۰۰، احراز هویت ۴۰۱، دسترسی ۴۰۳، یافت نشد ۴۰۴.  

---

## 16. نکات امنیتی

- در Production حتماً `DEBUG=False` و `SECRET_KEY` قوی تنظیم شود.  
- کلید `FIELD_ENCRYPTION_KEY` باید محرمانه بماند.  
- کوکی‌ها `HttpOnly` و `Secure` (در صورت استفاده از SSL) باشند.  
- از Nginx برای پروکسی و SSL استفاده کنید.  
- پورت‌های دیتابیس و Redis روی میزبان باز نباشند (در `docker-compose.yml` می‌توان `ports` را حذف کرد).  
- برای WebSocket از WSS (با SSL) استفاده کنید.  

---

## 17. عیب‌یابی رایج

| مشکل | راه‌حل |
|------|--------|
| `FIELD_ENCRYPTION_KEY is empty` | کلید را طبق بخش «تولید کلیدهای امنیتی» بسازید و در `.env` تنظیم کنید. |
| `address already in use` برای پورت ۵۴۳۲/۶۳۷۹ | PostgreSQL یا Redis محلی در حال اجراست. پورت میزبان را در `docker-compose.yml` تغییر دهید (مثلاً `5433:5432`). |
| فایل‌های استاتیک ادمین بارگذاری نمی‌شوند | WhiteNoise به درستی تنظیم نشده. `STATICFILES_STORAGE` و Middleware را چک کنید و `collectstatic` را اجرا کنید. |
| WebSocket متصل نمی‌شود | مطمئن شوید Daphne روی پورت ۸۰۰۱ اجراست و توکن در query string ارسال می‌شود. |
| Swagger خطای ۴۰۱ می‌دهد | دسترسی Swagger عمومی است؛ اگر با مرورگر وارد می‌شوید و قبلاً لاگین کرده‌اید، از یک پنجره Incognito استفاده کنید یا کوکی‌ها را پاک کنید. |
