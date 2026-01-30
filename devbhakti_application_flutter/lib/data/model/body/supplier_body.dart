// // To parse this JSON data, do
// //
// //     final supplierBody = supplierBodyFromJson(jsonString);
//
// import 'dart:convert';
//
// import 'package:image_picker/image_picker.dart';
//
// SupplierBody supplierBodyFromJson(String str) =>
//     SupplierBody.fromJson(json.decode(str));
//
// String supplierBodyToJson(SupplierBody data) => json.encode(data.toJson());
//
// class SupplierBody {
//   String? name;
//   String? lastName;
//   String? email;
//   String? password;
//   String? passwordConfirmation;
//   String? brandId;
//   String? phone;
//   String? latitude;
//   String? longitude;
//   String? city;
//   String? state;
//   String? country;
//   String? address;
//
//   XFile? profilePicture;
//
//   SupplierBody(
//       {this.name,
//       this.lastName,
//       this.email,
//       this.password,
//       this.passwordConfirmation,
//       this.brandId,
//       this.phone,
//       this.latitude,
//       this.longitude,
//       this.city,
//       this.state,
//       this.country,
//       this.address,
//       this.profilePicture});
//
//   factory SupplierBody.fromJson(Map<String, dynamic> json) => SupplierBody(
//         name: json["name"],
//         lastName: json["last_name"],
//         email: json["email"],
//         password: json["password"],
//         passwordConfirmation: json["password_confirmation"],
//         brandId: json["brand_id[]"],
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
//         "brand_id[]": brandId,
//         "phone": phone,
//         "latitude": latitude,
//         "longitude": longitude,
//         "city": city,
//         "state": state,
//         "country": country,
//         "address": address,
//       };
// }
