// // To parse this JSON data, do
// //
// //     final userBody = userBodyFromJson(jsonString);
//
// import 'dart:convert';
//
// import 'package:image_picker/image_picker.dart';
//
// UserBody userBodyFromJson(String str) => UserBody.fromJson(json.decode(str));
//
// String userBodyToJson(UserBody data) => json.encode(data.toJson());
//
// class UserBody {
//   String? name;
//   String? lastName;
//   String? email;
//   String? password;
//   String? passwordConfirmation;
//   String? phone;
//   String? latitude;
//   String? longitude;
//   String? city;
//   String? state;
//   String? country;
//   String? address;
//   XFile? profilePicture;
//
//   UserBody(
//       {this.name,
//       this.lastName,
//       this.email,
//       this.password,
//       this.passwordConfirmation,
//       this.phone,
//       this.latitude,
//       this.longitude,
//       this.city,
//       this.state,
//       this.country,
//       this.address,
//       this.profilePicture});
//
//   factory UserBody.fromJson(Map<String, dynamic> json) => UserBody(
//         name: json["name"],
//         lastName: json["last_name"],
//         email: json["email"],
//         password: json["password"],
//         passwordConfirmation: json["password_confirmation"],
//         phone: json["phone"],
//         latitude: json["latitude"],
//         longitude: json["longitude"],
//         city: json["city"],
//         state: json["state"],
//         country: json["country"],
//         address: json["address"],
//       );
//
//   Map<String, dynamic> toJson() => {
//         "name": name,
//         "last_name": lastName,
//         "email": email,
//         "password": password,
//         "password_confirmation": passwordConfirmation,
//         "phone": phone,
//         "latitude": latitude,
//         "longitude": longitude,
//         "city": city,
//         "state": state,
//         "country": country,
//         "address": address,
//       };
// }
