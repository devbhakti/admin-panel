// To parse this JSON data, do
//
//     final poojaModel = poojaModelFromJson(jsonString);

import 'dart:convert';

List<PoojaModel> poojaModelFromJson(String str) => List<PoojaModel>.from(json.decode(str).map((x) => PoojaModel.fromJson(x)));

String poojaModelToJson(List<PoojaModel> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class PoojaModel {
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
  DateTime? createdAt;
  DateTime? updatedAt;
  Temple? temple;

  PoojaModel({
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
    this.createdAt,
    this.updatedAt,
    this.temple,
  });

  factory PoojaModel.fromJson(Map<String, dynamic> json) => PoojaModel(
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
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    updatedAt: json["updatedAt"] == null ? null : DateTime.parse(json["updatedAt"]),
    temple: json["temple"] == null ? null : Temple.fromJson(json["temple"]),
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
    "createdAt": createdAt?.toIso8601String(),
    "updatedAt": updatedAt?.toIso8601String(),
    "temple": temple?.toJson(),
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

class Temple {
  String? name;
  String? location;
  String? image;

  Temple({
    this.name,
    this.location,
    this.image,
  });

  factory Temple.fromJson(Map<String, dynamic> json) => Temple(
    name: json["name"],
    location: json["location"],
    image: json["image"],
  );

  Map<String, dynamic> toJson() => {
    "name": name,
    "location": location,
    "image": image,
  };
}
