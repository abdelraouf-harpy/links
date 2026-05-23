# HarpyMenu Platform — منصة عرض منيو المطاعم الذكي (SaaS)

منصة عرض قوائم طعام (منيو) متكاملة ومخصصة للهواتف واللابتوب، تعمل بالكامل على الواجهة الأمامية (Pure Frontend) وتعتمد على **Firebase** كقاعدة بيانات سحابية ونظام إدارة المستخدمين بدون الحاجة لخوادم أو برمجة بايثون/Django. مناسبة جداً للرفع على **GitHub Pages** ومجانية تماماً للمشاريع الصغيرة.

---

## 🎯 الهيكل والصفحات الرئيسية

| الصفحة | الوصف | الفئة المستهدفة |
|--------|---------|---------|
| [index.html](./index.html) | صفحة الهبوط والتسويق للمنصة | عام |
| [login.html](./login.html) | صفحة تسجيل دخول المدراء والأدمن | المدراء والمسؤولين |
| [menu.html](./menu.html) | منيو عرض الأصناف والتفاصيل (`menu.html?r=slug`) | الزبائن |
| [manager.html](./manager.html) | لوحة تحكم مدير المطعم (إضافة أصناف/أقسام/تعديل صور) | مدير المطعم |
| [platform.html](./platform.html) | لوحة السوبر أدمن (إدارة المطاعم والاشتراكات السنوية) | أنت (صاحب المنصة) |

---

## 🚀 خطوات إعداد وربط قاعدة البيانات (Firebase)

المشروع جاهز تماماً للتشغيل، كل ما تحتاجه هو إعداد مشروع Firebase مجاني وربطه بالأكواد:

### 1. إنشاء مشروع Firebase
1. افتح [Firebase Console](https://console.firebase.google.com).
2. اضغط على **Add project** وقم بتسميته (مثلاً `harpymenu-platform`).
3. اضغط على أيقونة الويب **(</>)** لإنشاء Web App.
4. انسخ كود الإعداد (config) الذي يظهر لك، وسيكون شبيهاً بـ:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. افتح الملف [js/firebase.js](./js/firebase.js) واستبدل قيم المتغير `firebaseConfig` بالقيم التي نسختها.

### 2. تفعيل الخدمات في Firebase
من القائمة الجانبية في Firebase Console، قم بتفعيل الآتي:

1. **Authentication**:
   * اضغط على **Build > Authentication > Get Started**.
   * اختر تبويب **Sign-in method** وقم بتفعيل **Email/Password**.

2. **Cloud Firestore**:
   * اضغط على **Build > Firestore Database > Create database**.
   * اختر الموقع الجغرافي الأقرب لك، ثم اختر **Start in test mode** (سنقوم بضبط القواعد الأمنية لاحقاً).

3. **Storage (لرفع الصور)**:
   * اضغط على **Build > Storage > Get Started**.
   * اختر **Start in test mode** واضغط Done.

---

## 🔐 القواعد الأمنية (Security Rules)

لحماية بيانات مشروعك ومنع التلاعب بالأسعار أو الاشتراكات، انسخ القواعد التالية وضعها في تبويب **Rules** لكل خدمة:

### 1. قواعد Firestore Database Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // دالة للتحقق من أن المستخدم هو السوبر أدمن
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    // دالة للتحقق من أن المستخدم هو مدير هذا المطعم المحدد
    function isManagerOf(restaurantId) {
      return request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.restaurantId == restaurantId;
    }

    // ملفات المستخدمين (الأدوار)
    match /users/{uid} {
      allow read: if request.auth != null;
      allow write: if isAdmin() || (request.auth != null && request.auth.uid == uid);
    }

    // المطاعم
    match /restaurants/{restaurantId} {
      // المنيو متاح للجميع إذا كان المطعم نشطاً
      allow read: if resource == null || resource.data.isActive == true || isAdmin() || isManagerOf(restaurantId);
      allow create, delete: if isAdmin();
      allow update: if isAdmin() || isManagerOf(restaurantId);
      
      // الأقسام الفرعية داخل المطعم
      match /categories/{categoryId} {
        allow read: if true;
        allow write: if isAdmin() || isManagerOf(restaurantId);
        
        // الأصناف داخل الأقسام
        match /items/{itemId} {
          allow read: if true;
          allow write: if isAdmin() || isManagerOf(restaurantId);
        }
      }
    }
  }
}
```

### 2. قواعد Storage Rules (للأقسام وشعارات المطاعم)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /restaurants/{restaurantId}/{allPaths=**} {
      // قراءة الصور عامة للجميع
      allow read: if true;
      // الكتابة وحذف الصور متاح فقط للأدمن أو مدير المطعم نفسه
      allow write, delete: if request.auth != null && (
        // يمكنك التحقق من صلاحيات قاعدة البيانات أو السماح لأي مستخدم مسجل مؤقتاً لرفع الصور
        request.auth != null
      );
    }
  }
}
```

---

## 👑 إنشاء أول حساب سوبر أدمن (Super Admin)

بما أن التسجيل المفتوح غير متاح لحماية النظام، يمكنك إنشاء حساب السوبر أدمن الخاص بك يدوياً كالتالي:

1. اذهب إلى **Firebase Console > Authentication** واضغط على **Add user**.
2. أدخل البريد الإلكتروني وكلمة المرور الخاصة بك (مثال: `admin@harpymenu.com`).
3. بعد الإنشاء، قم بنسخ الـ **User UID** الخاص بالحساب الجديد.
4. اذهب إلى **Firestore Database** واضغط على **Start collection** باسم `users`.
5. ضع في حقل الـ Document ID قيمة الـ **User UID** الذي نسخته.
6. أضف الحقول التالية:
   * `role`: من نوع `string` وقيمته `ADMIN`.
   * `email`: من نوع `string` وقيمته بريدك الإلكتروني.
7. الآن افتح الرابط واذهب إلى [login.html](./login.html) وسجل دخولك لتنتقل تلقائياً إلى لوحة تحكم السوبر أدمن [platform.html](./platform.html).

---

## 🌐 النشر على GitHub Pages

الموقع استاتيكي بالكامل، لنشر المنصة مجاناً في دقيقتين:

1. أنشئ مستودع (Repository) جديد على حسابك في GitHub.
2. ارفع ملفات هذا المجلد مباشرة إلى المستودع.
3. اذهب إلى **Settings > Pages** في المستودع الخاص بك.
4. تحت قسم **Build and deployment**، اختر الفرع الرئيسي `main` (أو `master`) والمجلد `/ (root)`.
5. اضغط **Save**. وخلال دقيقة سيكون موقعك جاهزاً للعمل ومتاحاً للعالم!

---

## 💡 معلومات تشغيلية هامة
* **معاينة المنيو التجريبي**: يدعم الموقع الانتقال المباشر للمنيو التجريبي عبر الرابط `menu.html?r=demo` دون الحاجة للاتصال بقاعدة بيانات Firebase (يتم تحميل بيانات وهمية جميلة مدمجة كـ fallback).
* **إدارة الاشتراكات**: يدعم النظام تحديد نوع الاشتراك (سنوي/شهري/تجريبي) وتاريخ الانتهاء لتتبع الاشتراكات مع المطاعم.
