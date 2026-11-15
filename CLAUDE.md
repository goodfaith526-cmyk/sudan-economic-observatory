# قواعد المشروع الثابتة

اقرأ HANDOVER.md قبل أي شغل، وحدّثو في نهاية كل جلسة.
اتبع HANDOVER_GUIDE.md عند كتابة الهاندوفر، وعلّم المعلومات غير المثبتة بـ(غير مؤكد).

- المشروع المحدد: goodfaith526-cmyk/sudan-economic-observatory؛ الفرع الأساسي main.
- قبل العمل راجع main المستعاد وتاريخ Git وحالة الشجرة؛ لا تبدأ من checkout فارغ.
- الـstack المثبت: HTML/CSS وVanilla JavaScript، وخدمات window.SEO_SERVICES، وlocalStorage.
- لا تفترض وجود Vite أو package.json أو frontend/src؛ افحص الشجرة والمسارات الفعلية.
- التشغيل المقصود من جذر الريبو: `node static-server.mjs` ثم `http://127.0.0.1:4173/`.
- متغير الخادم الاختياري: `PORT`؛ لا تحفظ قيم أسرار في الوثائق.
- تحقق من مسارات الأصول؛ HTTP 200 للصفحة وحدها لا يثبت تحميل JavaScript وCSS.
- فحص syntax: `node --check app.js` و`node --check trade-service.js` و`node --check trade-extraction-service.js`.
- لا يوجد أمر build مثبت؛ استخدم أوامر الاختبار والبناء الموجودة فعلياً فقط.
- حافظ على Arabic RTL والهوية البصرية والميزات الحالية؛ التغييرات تدريجية ومحدودة.
- منطق التخزين والاستعلام في trade-service.js، وهوية السلع في commodity-dictionary.js وcommodity-service.js.
- app.js يربط الواجهة؛ اتبع wrappers والأنماط الموجودة دون إعادة هيكلة غير مطلوبة.
- Excel المنضبط هو اتجاه الإدخال الأساسي المعتمد؛ توسعة PDF موقوفة حتى توجيه صريح.
- لا backend أو قاعدة بيانات خارجية أو نظام auth جديد دون تكليف مستقل.
- لا OCR أو AI extraction أو universal parser أو قيم اقتصادية مخترعة أو balancing rows.
- التجارة تستخدم seo_obs_v2؛ السوق seo_mp_v1؛ المنتدى seo_forum_v2. لا تغيّر المفاتيح.
- لا localStorage.clear() ولا تعديل مجالات السوق والمنتدى والمكتبة ضمن عمل التجارة.
- localStorage يتبع origin؛ استخدم نفس الأصل واختبر JSON backup/import قبل نقل البيانات.
- أدخل البيانات كمسودات؛ لا نشر تلقائي ولا تجاوز validation/readiness.
- لا تغيّر draft observations أثناء مهمة diagnostics إلا metadata العرض المصرح بها.
- الموافقة تتطلب توجيهاً صريحاً وتأكيداً مطابقاً للمسار المعتمد؛ لا تفترض أن الرفع موافقة.
- احفظ sourceFileId وimportBatchId وextractionRuleId/version ومرجع الصفحة/الجدول أو sheet/row المتاح فعلاً.
- احتفظ raw commodity labels وvalidation وreview_required وlineage عند الموافقة والتراجع والتصدير.
- commodityId هو هوية واحدة بأسماء متعددة اللغات؛ لا تفصل العربي والإنجليزي كسلعتين.
- لا تدمج subtypes أو Others من فئات مختلفة دون دليل سياق موثوق.
- افصل publicationIssue عن coveredEconomicPeriod؛ نشرة Q4 ليست بالضرورة بيانات الربع الرابع فقط.
- اجعل periodType صريحاً؛ لا تجمع annual وmonthly وquarterly في إجمالي واحد.
- احسب الميزان من صادرات وواردات منشورة بنفس الفلاتر والطبقة: exports - imports.
- category/subtotal/grand_total لا تصبح detail observations أو خيارات سلع دون تصميم صريح.
- التراجع محدد بالسنة والباتش والقاعدة والطبقة؛ يحفظ المصدر والمسودات والتحقق والبيانات غير المرتبطة.
- اختبر الاستمرار بعد reload والتكرار والتراجع وفصل الطبقات عند تغيير مسار البيانات.
- لا تخزن نص PDF والتشخيصات الكبيرة بلا حدود في localStorage؛ راع quota.
- لا تسجل passwords أو tokens أو keys؛ اذكر أسماء الإعدادات فقط.
- بوابة الإدارة داخل frontend ليست نظام مصادقة إنتاجياً؛ لا توثق قيمة كلمة مرورها.
- لا force push ولا دمج PR أو حذف بيانات دون توجيه صريح ومحدد.
- عند طلب PR بملفات محددة، تحقق من diff النهائي ولا تضم ملفات أخرى.
