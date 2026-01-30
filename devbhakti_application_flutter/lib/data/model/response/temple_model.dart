// To parse this JSON data, do
//
//     final templeModel = templeModelFromJson(jsonString);

import 'dart:convert';

List<TempleModel> templeModelFromJson(String str) => List<TempleModel>.from(json.decode(str).map((x) => TempleModel.fromJson(x)));

String templeModelToJson(List<TempleModel> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class TempleModel {
  String? id;
  String? name;
  String? location;
  String? fullAddress;
  String? description;
  String? history;
  String? image;
  List<String>? heroImages;
  List<dynamic>? gallery;
  int? rating;
  int? reviewsCount;
  String? category;
  bool? liveStatus;
  String? openTime;
  String? phone;
  String? website;
  String? mapUrl;
  String? viewers;
  bool? isLive;
  String? userId;
  DateTime? createdAt;
  DateTime? updatedAt;
  List<Pooja>? poojas;
  bool? isFavorite;

  TempleModel({
    this.id,
    this.name,
    this.location,
    this.fullAddress,
    this.description,
    this.history,
    this.image,
    this.heroImages,
    this.gallery,
    this.rating,
    this.reviewsCount,
    this.category,
    this.liveStatus,
    this.openTime,
    this.phone,
    this.website,
    this.mapUrl,
    this.viewers,
    this.isLive,
    this.userId,
    this.createdAt,
    this.updatedAt,
    this.poojas,
    this.isFavorite,
  });

  factory TempleModel.fromJson(Map<String, dynamic> json) => TempleModel(
    id: json["id"],
    name: json["name"],
    location: json["location"],
    fullAddress: json["fullAddress"],
    description: json["description"],
    history: json["history"],
    image: json["image"],
    heroImages: json["heroImages"] == null ? [] : List<String>.from(json["heroImages"]!.map((x) => x)),
    gallery: json["gallery"] == null ? [] : List<dynamic>.from(json["gallery"]!.map((x) => x)),
    rating: json["rating"],
    reviewsCount: json["reviewsCount"],
    category: json["category"],
    liveStatus: json["liveStatus"],
    openTime: json["openTime"],
    phone: json["phone"],
    website: json["website"],
    mapUrl: json["mapUrl"],
    viewers: json["viewers"],
    isLive: json["isLive"],
    userId: json["userId"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    poojas: json["poojas"] == null ? [] : List<Pooja>.from(json["poojas"]!.map((x) => Pooja.fromJson(x))),
    isFavorite: json["isFavorite"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "location": location,
    "fullAddress": fullAddress,
    "description": description,
    "history": history,
    "image": image,
    "heroImages": heroImages == null ? [] : List<dynamic>.from(heroImages!.map((x) => x)),
    "gallery": gallery == null ? [] : List<dynamic>.from(gallery!.map((x) => x)),
    "rating": rating,
    "reviewsCount": reviewsCount,
    "category": category,
    "liveStatus": liveStatus,
    "openTime": openTime,
    "phone": phone,
    "website": website,
    "mapUrl": mapUrl,
    "viewers": viewers,
    "isLive": isLive,
    "userId": userId,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "poojas": poojas == null ? [] : List<dynamic>.from(poojas!.map((x) => x.toJson())),
    "isFavorite": isFavorite,
  };
}

class Pooja {
  String? id;
  String? name;
  String? category;
  int? price;
  String? duration;
  List<String>? description;
  String? time;
  String? image;
  String? about;
  List<String>? benefits;
  List<String>? bullets;
  dynamic process;
  List<ProcessStep>? processSteps;
  String? templeId;
  dynamic templeDetails;
  List<Package>? packages;
  List<Faq>? faqs;
  dynamic reviews;
  bool? status;
  DateTime? createdAt;
  DateTime? updatedAt;

  Pooja({
    this.id,
    this.name,
    this.category,
    this.price,
    this.duration,
    this.description,
    this.time,
    this.image,
    this.about,
    this.benefits,
    this.bullets,
    this.process,
    this.processSteps,
    this.templeId,
    this.templeDetails,
    this.packages,
    this.faqs,
    this.reviews,
    this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory Pooja.fromJson(Map<String, dynamic> json) => Pooja(
    id: json["id"],
    name: json["name"],
    category: json["category"],
    price: json["price"],
    duration: json["duration"],
    description: json["description"] == null ? [] : List<String>.from(json["description"]!.map((x) => x)),
    time: json["time"],
    image: json["image"],
    about: json["about"],
    benefits: json["benefits"] == null ? [] : List<String>.from(json["benefits"]!.map((x) => x)),
    bullets: json["bullets"] == null ? [] : List<String>.from(json["bullets"]!.map((x) => x)),
    process: json["process"],
    processSteps: json["processSteps"] == null ? [] : List<ProcessStep>.from(json["processSteps"]!.map((x) => ProcessStep.fromJson(x))),
    templeId: json["templeId"],
    templeDetails: json["templeDetails"],
    packages: json["packages"] == null ? [] : List<Package>.from(json["packages"]!.map((x) => Package.fromJson(x))),
    faqs: json["faqs"] == null ? [] : List<Faq>.from(json["faqs"]!.map((x) => Faq.fromJson(x))),
    reviews: json["reviews"],
    status: json["status"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "category": category,
    "price": price,
    "duration": duration,
    "description": description == null ? [] : List<dynamic>.from(description!.map((x) => x)),
    "time": time,
    "image": image,
    "about": about,
    "benefits": benefits == null ? [] : List<dynamic>.from(benefits!.map((x) => x)),
    "bullets": bullets == null ? [] : List<dynamic>.from(bullets!.map((x) => x)),
    "process": process,
    "processSteps": processSteps == null ? [] : List<dynamic>.from(processSteps!.map((x) => x.toJson())),
    "templeId": templeId,
    "templeDetails": templeDetails,
    "packages": packages == null ? [] : List<dynamic>.from(packages!.map((x) => x.toJson())),
    "faqs": faqs == null ? [] : List<dynamic>.from(faqs!.map((x) => x.toJson())),
    "reviews": reviews,
    "status": status,
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
  };
}

class Faq {
  String? a;
  String? q;

  Faq({
    this.a,
    this.q,
  });

  factory Faq.fromJson(Map<String, dynamic> json) => Faq(
    a: json["a"],
    q: json["q"],
  );

  Map<String, dynamic> toJson() => {
    "a": a,
    "q": q,
  };
}

class Package {
  String? name;
  int? price;
  String? description;

  Package({
    this.name,
    this.price,
    this.description,
  });

  factory Package.fromJson(Map<String, dynamic> json) => Package(
    name: json["name"],
    price: json["price"],
    description: json["description"],
  );

  Map<String, dynamic> toJson() => {
    "name": name,
    "price": price,
    "description": description,
  };
}

class ProcessStep {
  String? title;
  String? description;

  ProcessStep({
    this.title,
    this.description,
  });

  factory ProcessStep.fromJson(Map<String, dynamic> json) => ProcessStep(
    title: json["title"],
    description: json["description"],
  );

  Map<String, dynamic> toJson() => {
    "title": title,
    "description": description,
  };
}
