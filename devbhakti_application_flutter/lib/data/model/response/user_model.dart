// To parse this JSON data, do
//
//     final userModel = userModelFromJson(jsonString);

import 'dart:convert';

UserModel userModelFromJson(String str) => UserModel.fromJson(json.decode(str));

String userModelToJson(UserModel data) => json.encode(data.toJson());

class UserModel {
  User? user;

  UserModel({
    this.user,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    user: json["user"] == null ? null : User.fromJson(json["user"]),
  );

  Map<String, dynamic> toJson() => {
    "user": user?.toJson(),
  };
}

class User {
  String? id;
  String? name;
  String? phone;
  dynamic email;
  String? role;
  dynamic profileImage;
  bool? isVerified;
  DateTime? createdAt;

  User({
    this.id,
    this.name,
    this.phone,
    this.email,
    this.role,
    this.profileImage,
    this.isVerified,
    this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json["id"],
    name: json["name"],
    phone: json["phone"],
    email: json["email"],
    role: json["role"],
    profileImage: json["profileImage"],
    isVerified: json["isVerified"],
    createdAt: json["createdAt"] == null ? null : DateTime.parse(json["createdAt"]),
  );

  Map<String, dynamic> toJson() => {
    "id": id,
    "name": name,
    "phone": phone,
    "email": email,
    "role": role,
    "profileImage": profileImage,
    "isVerified": isVerified,
    "createdAt": createdAt?.toIso8601String(),
  };
}
