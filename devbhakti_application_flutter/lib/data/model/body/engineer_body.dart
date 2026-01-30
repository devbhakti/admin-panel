// To parse this JSON data, do
//
//     final engineerBody = engineerBodyFromJson(jsonString);

import 'dart:convert';

EngineerBody engineerBodyFromJson(String str) =>
    EngineerBody.fromJson(json.decode(str));

String engineerBodyToJson(EngineerBody data) => json.encode(data.toJson());

class EngineerBody {
  String? name;
  String? lastName;
  String? email;
  String? password;
  String? passwordConfirmation;
  String? phone;
  String? latitude;
  String? longitude;
  String? city;
  String? state;
  String? country;
  String? address;
  List<int>? expertiseId;
  List<int>? brandId;

  EngineerBody({
    this.name,
    this.lastName,
    this.email,
    this.password,
    this.passwordConfirmation,
    this.phone,
    this.latitude,
    this.longitude,
    this.city,
    this.state,
    this.country,
    this.address,
    this.expertiseId,
    this.brandId,
  });

  factory EngineerBody.fromJson(Map<String, dynamic> json) => EngineerBody(
        name: json["name"],
        lastName: json["last_name"],
        email: json["email"],
        password: json["password"],
        passwordConfirmation: json["password_confirmation"],
        phone: json["phone"],
        latitude: json["latitude"],
        longitude: json["longitude"],
        city: json["city"],
        state: json["state"],
        country: json["country"],
        address: json["address"],
        expertiseId: json["expertise_id"] == null
            ? []
            : List<int>.from(json["expertise_id"]!.map((x) => x)),
        brandId: json["brand_id"] == null
            ? []
            : List<int>.from(json["brand_id"]!.map((x) => x)),
      );

  Map<String, dynamic> toJson() => {
        "name": name,
        "last_name": lastName,
        "email": email,
        "password": password,
        "password_confirmation": passwordConfirmation,
        "phone": phone,
        "latitude": latitude,
        "longitude": longitude,
        "city": city,
        "state": state,
        "country": country,
        "address": address,
        "expertise_id": expertiseId == null
            ? []
            : List<dynamic>.from(expertiseId!.map((x) => x)),
        "brand_id":
            brandId == null ? [] : List<dynamic>.from(brandId!.map((x) => x)),
      };
}
