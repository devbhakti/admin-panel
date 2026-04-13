const fs = require('fs');

const hiPath = 'src/locales/hi.json';
const hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// 1. Fix contact form
if (hi.contact && hi.contact.form) {
    hi.contact.form.name = "पूरा नाम";
    hi.contact.form.email = "ईमेल पता";
    hi.contact.form.subject = "विषय";
    hi.contact.form.message = "संदेश";
    hi.contact.form.placeholder_name = "आपका नाम";
    hi.contact.form.placeholder_email = "email@example.com";
    hi.contact.form.placeholder_subject = "हम कैसे मदद कर सकते हैं?";
    hi.contact.form.placeholder_message = "आपका संदेश...";
    hi.contact.form.submit = "पूछताछ भेजें";
}

// 2. Add seller_login
if (!hi.seller_login) {
    hi.seller_login = {
        "title": "विक्रेता पोर्टल",
        "subtitle": "अपना देवभक्ति स्टोर, उत्पाद और ऑर्डर प्रबंधित करें।",
        "phone_label": "मोबाइल नंबर",
        "phone_hint": "हम आपके खाते को सत्यापित करने के लिए एक OTP भेजेंगे।",
        "send_otp": "OTP भेजें",
        "checking": "जाँच हो रही है...",
        "dev_otp": "डेवलपमेंट OTP",
        "enter_otp_label": "OTP दर्ज करें",
        "change_phone": "नंबर बदलें",
        "otp_sent_to": "पर भेजा गया",
        "login_button": "स्टोर में लॉगिन करें",
        "verifying": "सत्यापित किया जा रहा है...",
        "resend_code": "कोड प्राप्त नहीं हुआ?",
        "resend": "पुनः भेजें",
        "staff_login": "विक्रेता कर्मचारी? यहाँ लॉगिन करें",
        "footer_assistance": "सहायता के लिए संपर्क करें",
        "secure_login": "सुरक्षित लॉगिन",
        "not_registered": {
            "title": "खाता पंजीकृत नहीं है",
            "p1": "आपका खाता हमारे साथ विक्रेता के रूप में पंजीकृत नहीं है।",
            "p2": "देवभक्ति पर विक्रेता बनने के लिए, अपना अनुरोध यहाँ सबमिट करें:",
            "button": "दूसरा नंबर आज़माएँ"
        }
    };
}

// 3. Unnest and fix legal
if (hi.legal) {
    if (Array.isArray(hi.legal.terms)) {
        hi.terms = {
            "title": "सेवा की शर्तें",
            "effective_date": "प्रभावी तारीख: 7 फरवरी 2026",
            "intro_p1": "ये सेवा की शर्तें (\"शर्तें\") DevBhakti वेबसाइट, मोबाइल एप्लिकेशन और संबंधित सेवाओं (सामूहिक रूप से, \"प्लेटफ़ॉर्म\") तक आपकी पहुंच और उपयोग को नियंत्रित करती हैं।",
            "intro_p2": "DevBhakti का स्वामित्व और संचालन Divinity Labs Private Limited द्वारा किया जाता है, जो कंपनी अधिनियम, 2013 के तहत निगमित कंपनी है, जिसका पंजीकृत कार्यालय भारत में है (जिसे इसमें इसके बाद \"कंपनी\", \"DevBhakti\", \"हम\", \"हमारे\" या \"हमें\" के रूप में संदर्भित किया गया है)।",
            "intro_p3": "प्लेटफ़ॉर्म तक पहुँचने या उपयोग करने पर, आप इन शर्तों से बंधे होने के लिए सहमत होते हैं।",
            "clauses": hi.legal.terms
        };
    } else if (hi.legal.terms) {
        hi.terms = hi.legal.terms;
    }

    if (hi.legal.privacy) hi.privacy = hi.legal.privacy;
    if (hi.legal.returns_policy) hi.returns_policy = hi.legal.returns_policy;
    if (hi.legal.shipping_policy) hi.shipping_policy = hi.legal.shipping_policy;
    if (hi.legal.grievance) hi.grievance = hi.legal.grievance;

    delete hi.legal;
}

const en = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
const newHi = {};
for (const key of Object.keys(en)) {
    if (key in hi) {
        newHi[key] = hi[key];
    } else {
        newHi[key] = en[key]; // fallback to en just in case
    }
}
for (const key of Object.keys(hi)) {
    if (!(key in newHi)) {
        newHi[key] = hi[key];
    }
}

fs.writeFileSync(hiPath, JSON.stringify(newHi, null, 2) + '\n');
console.log('Successfully fixed hi.json structure!');
