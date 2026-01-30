// To parse this JSON data, do
//
//     final templeFavouriteModel = templeFavouriteModelFromJson(jsonString);

import 'dart:convert';

List<TempleFavouriteModel> templeFavouriteModelFromJson(String str) => List<TempleFavouriteModel>.from(json.decode(str).map((x) => TempleFavouriteModel.fromJson(x)));

String templeFavouriteModelToJson(List<TempleFavouriteModel> data) => json.encode(List<dynamic>.from(data.map((x) => x.toJson())));

class TempleFavouriteModel {
  String? id;
  String? userId;
  String? templeId;
  dynamic poojaId;
  dynamic productId;
  DateTime? createdAt;
  Temple? temple;
  dynamic pooja;

  TempleFavouriteModel({
    this.id,
    this.userId,
    this.templeId,
    this.poojaId,
    this.productId,
    this.createdAt,
    this.temple,
    this.pooja,
  });

  factory TempleFavouriteModel.fromJson(Map<String, dynamic> json) => TempleFavouriteModel(
    id: json["id"],
    userId: json["userId"],
    templeId: json["templeId"],
    poojaId: json["poojaId"],
    productId: json["productId"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
    temple: json["temple"] == null ? null : Temple.fromJson(json["temple"]),
    pooja: json["pooja"],
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "userId": userId,
    "templeId": templeId,
    "poojaId": poojaId,
    "productId": productId,
    "createdAt": createdAt?.toIso8601String(),
    "temple": temple?.toJson(),
    "pooja": pooja,
  };
}

class Temple {
  String? id;
  String? name;
  String? location;
  String? fullAddress;
  String? description;
  String? history;
  dynamic image;
  List<dynamic>? heroImages;
  List<dynamic>? gallery;
  int? rating;
  int? reviewsCount;
  String? category;
  bool? liveStatus;
  String? openTime;
  String? phone;
  dynamic website;
  dynamic mapUrl;
  dynamic viewers;
  bool? isLive;
  String? userId;
  DateTime? createdAt;
  DateTime? updatedAt;

  Temple({
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
  });

  factory Temple.fromJson(Map<String, dynamic> json) => Temple(
    id: json["id"],
    name: json["name"],
    location: json["location"],
    fullAddress: json["fullAddress"],
    description: json["description"],
    history: json["history"],
    image: json["image"],
    heroImages: json["heroImages"] == null ? [] : List<dynamic>.from(json["heroImages"]!.map((x) => x)),
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
  };
}
