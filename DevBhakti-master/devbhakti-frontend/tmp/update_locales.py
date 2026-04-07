import json
import os

def update_json(file_path, lang_data):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Update common keys if missing
    common_updates = {
        "add": {"en": "Add", "hi": "जोड़ें", "mr": "जोडा"}[os.path.basename(file_path).split('.')[0]],
        "add_paragraph": {"en": "Add Paragraph", "hi": "अनुच्छेद जोड़ें", "mr": "परिच्छेद जोडा"}[os.path.basename(file_path).split('.')[0]],
        "add_step": {"en": "Add Step", "hi": "चरण जोड़ें", "mr": "टप्पा जोडा"}[os.path.basename(file_path).split('.')[0]],
        "add_faq": {"en": "Add Question", "hi": "प्रश्न जोड़ें", "mr": "प्रश्न जोडा"}[os.path.basename(file_path).split('.')[0]],
        "cancel": {"en": "Cancel", "hi": "रद्द करें", "mr": "रद्द करा"}[os.path.basename(file_path).split('.')[0]],
        "processing": {"en": "Processing...", "hi": "प्रक्रिया में है...", "mr": "प्रक्रिया सुरू आहे..."}[os.path.basename(file_path).split('.')[0]]
    }
    
    if "common" not in data:
        data["common"] = {}
    
    for k, v in common_updates.items():
        if k not in data["common"]:
            data["common"][k] = v
            
    # Add/Update admin_pooja_form
    data["admin_pooja_form"] = lang_data
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_path}")

# English Data
admin_pooja_form_en = {
    "sections": {
      "identity": "Service Identity & Configuration",
      "details": "Localized Details",
      "shared": "Shared Global Settings",
      "packages": "Pricing & Packages",
      "ritual": "Ritual Process Steps",
      "faqs": "Frequently Asked Questions"
    },
    "labels": {
      "name": "Pooja/Service Name",
      "category": "Categories/Purpose",
      "about": "About this Service",
      "benefits": "Key Benefits",
      "benefit": "Benefit",
      "highlights": "Service Highlights",
      "paragraph": "Paragraph",
      "master_identity": "Master Template Identity",
      "is_master": "Set as Master Pooja Template",
      "assigned_temple": "Assigned Temple",
      "price": "Base/Starting Price",
      "time": "Service Timings",
      "banner": "Service Banner Image",
      "banner_title": "Upload Professional Service Visuals",
      "upload": "Upload",
      "select_tier": "Select Service Packages/Tiers",
      "tier_type": "Package Tier",
      "tier_price": "Tier Price",
      "tier_note": "Package Note/Subtitle",
      "step_title": "Step Title",
      "step_desc": "Step Description",
      "faq_q": "Question",
      "faq_a": "Answer"
    },
    "placeholders": {
      "name": "Enter service name...",
      "category": "Select categories...",
      "search_category": "Search categories...",
      "about": "Provide a brief overview of the pooja...",
      "highlight": "Add point...",
      "not_applicable": "Not Applicable (Master Template)",
      "select_temple": "Select a temple...",
      "time": "e.g. 6:00 AM - 12:00 PM",
      "tier_note": "e.g. For family of 4...",
      "step_title": "e.g. Sankap",
      "step_desc": "Explain what happens...",
      "faq_q": "Enter frequently asked question...",
      "faq_a": "Enter detailed response..."
    },
    "help": {
      "is_master": "Master templates act as blueprints for all temples.",
      "banner": "High-quality 16:9 images work best for highlighting the ritual spiritual essence."
    },
    "actions": {
      "create": "Create Pooja Service",
      "update": "Update Service Details"
    },
    "crop_modal": {
      "title": "Crop Service Image"
    }
}

# Hindi Data
admin_pooja_form_hi = {
    "sections": {
        "identity": "सेवा पहचान और विन्यास",
        "details": "स्थानीयकृत विवरण",
        "shared": "साझा वैश्विक सेटिंग्स",
        "packages": "मूल्य और पैकेज",
        "ritual": "अनुष्ठान प्रक्रिया के चरण",
        "faqs": "अक्सर पूछे जाने वाले प्रश्न"
    },
    "labels": {
        "name": "पूजा/सेवा का नाम",
        "category": "श्रेणियां/उद्देश्य",
        "about": "इस सेवा के बारे में",
        "benefits": "मुख्य लाभ",
        "benefit": "लाभ",
        "highlights": "सेवा की खास बातें",
        "paragraph": "अनुच्छेद",
        "master_identity": "मास्टर टेम्पलेट पहचान",
        "is_master": "मास्टर पूजा टेम्पलेट के रूप में सेट करें",
        "assigned_temple": "नियुक्त मंदिर",
        "price": "आधार/शुरुआती कीमत",
        "time": "सेवा का समय",
        "banner": "सेवा बैनर छवि",
        "banner_title": "पेशेवर सेवा विजुअल अपलोड करें",
        "upload": "अपलोड करें",
        "select_tier": "सेवा पैकेज/स्तर चुनें",
        "tier_type": "पैकेज स्तर",
        "tier_price": "स्तर की कीमत",
        "tier_note": "पैकेज नोट/उपशीर्षक",
        "step_title": "चरण का शीर्षक",
        "step_desc": "चरण का विवरण",
        "faq_q": "प्रश्न",
        "faq_a": "उत्तर"
    },
    "placeholders": {
        "name": "सेवा का नाम दर्ज करें...",
        "category": "श्रेणियां चुनें...",
        "search_category": "श्रेणियां खोजें...",
        "about": "पूजा का संक्षिप्त विवरण प्रदान करें...",
        "highlight": "बिंदु जोड़ें...",
        "not_applicable": "लागू नहीं (मास्टर टेम्पलेट)",
        "select_temple": "एक मंदिर चुनें...",
        "time": "जैसे: सुबह 6:00 - दोपहर 12:00",
        "tier_note": "जैसे: 4 लोगों के परिवार के लिए...",
        "step_title": "जैसे: संकल्प",
        "step_desc": "बताएं कि क्या होता है...",
        "faq_q": "अक्सर पूछे जाने वाले प्रश्न दर्ज करें...",
        "faq_a": "विस्तृत उत्तर दर्ज करें..."
    },
    "help": {
        "is_master": "मास्टर टेम्पलेट सभी मंदिरों के लिए ब्लूप्रिंट के रूप में कार्य करते हैं।",
        "banner": "उच्च गुणवत्ता वाली 16:9 छवियां अनुष्ठान के आध्यात्मिक सार को उजागर करने के लिए सबसे अच्छा काम करती हैं।"
    },
    "actions": {
        "create": "पूजा सेवा बनाएं",
        "update": "सेवा विवरण अपडेट करें"
    },
    "crop_modal": {
        "title": "सेवा छवि काटें"
    }
}

# Marathi Data
admin_pooja_form_mr = {
    "sections": {
        "identity": "सेवा ओळख आणि विन्यास",
        "details": "स्थानिकीकृत तपशील",
        "shared": "सामायिक जागतिक सेटिंग्ज",
        "packages": "किंमत आणि पॅकेजेस",
        "ritual": "विधि प्रक्रियेचे टप्पे",
        "faqs": "नेहमी विचारले जाणारे प्रश्न"
    },
    "labels": {
        "name": "पूजा/सेवेचे नाव",
        "category": "श्रेणी/उद्देश",
        "about": "या सेवेबद्दल",
        "benefits": "मुख्य फायदे",
        "benefit": "फायदा",
        "highlights": "सेवेची वैशिष्ट्ये",
        "paragraph": "परिच्छेद",
        "master_identity": "मास्टर टेम्पलेट ओळख",
        "is_master": "मास्टर पूजा टेम्पलेट म्हणून सेट करा",
        "assigned_temple": "नियुक्त मंदिर",
        "price": "आधार/सुरुवातीची किंमत",
        "time": "सेवेची वेळ",
        "banner": "सेवा बॅनर प्रतिमा",
        "banner_title": "प्रोफेशनल सेवा व्हिज्युअल अपलोड करा",
        "upload": "अपलोड करा",
        "select_tier": "सेवा पॅकेज/स्तर निवडा",
        "tier_type": "पॅकेज स्तर",
        "tier_price": "स्तराची किंमत",
        "tier_note": "पॅकेज टीप/उपशीर्षक",
        "step_title": "टप्प्याचे शीर्षक",
        "step_desc": "टप्प्याचे वर्णन",
        "faq_q": "प्रश्न",
        "faq_a": "उत्तर"
    },
    "placeholders": {
        "name": "सेवेचे नाव टाका...",
        "category": "श्रेणी निवडा...",
        "search_category": "श्रेणी शोधा...",
        "about": "पूजेचा थोडक्यात आढावा द्या...",
        "highlight": "मुद्दा जोडा...",
        "not_applicable": "लागू नाही (मास्टर टेम्पलेट)",
        "select_temple": "मंदिर निवडा...",
        "time": "उदा. सकाळी 6:00 - दुपारी 12:00",
        "tier_note": "उदा. 4 जणांच्या कुटुंबासाठी...",
        "step_title": "उदा. संकल्प",
        "step_desc": "काय घडते ते सांगा...",
        "faq_q": "नेहमी विचारले जाणारे प्रश्न टाका...",
        "faq_a": "तपशीलवार उत्तर टाका..."
    },
    "help": {
        "is_master": "मास्टर टेम्पलेट्स सर्व मंदिरांसाठी ब्लूप्रिंट म्हणून काम करतात.",
        "banner": "अनुष्ठानाचे आध्यात्मिक सार हायलाइट करण्यासाठी उच्च-गुणवत्तेच्या 16:9 प्रतिमा सर्वोत्तम कार्य करतात."
    },
    "actions": {
        "create": "पूजा सेवा तयार करा",
        "update": "सेवा तपशील अपडेट करा"
    },
    "crop_modal": {
        "title": "सेवा प्रतिमा क्रॉप करा"
    }
}

base_path = "c:/Users/admin/Downloads/DevBhakti-master/DevBhakti-master/devbhakti-frontend/src/locales/"
update_json(base_path + "en.json", admin_pooja_form_en)
update_json(base_path + "hi.json", admin_pooja_form_hi)
update_json(base_path + "mr.json", admin_pooja_form_mr)
