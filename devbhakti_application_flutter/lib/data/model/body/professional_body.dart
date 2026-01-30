// // To parse this JSON data, do
// //
// //     final professionalBody = professionalBodyFromJson(jsonString);
//
// import 'dart:convert';
//
//
// ProfessionalBody professionalBodyFromJson(String str) =>
//     ProfessionalBody.fromJson(json.decode(str));
//
// String professionalBodyToJson(ProfessionalBody data) =>
//     json.encode(data.toJson());
//
// class ProfessionalBody {
//   String? quotationType;
//   String? serviceCategory;
//   String? description;
//   String? latitude;
//   String? longitude;
//   List<int>? spareParts;
//
//   ProfessionalBody({
//     this.quotationType,
//     this.serviceCategory,
//     this.description,
//     this.latitude,
//     this.longitude,
//     this.spareParts,
//   });
//
//   factory ProfessionalBody.fromJson(Map<String, dynamic> json) =>
//       ProfessionalBody(
//         quotationType: json["quotation_type"],
//         serviceCategory: json["service_category"],
//         description: json["description"],
//         latitude: json["latitude"],
//         longitude: json["longitude"],
//         spareParts: json["spare_parts"] == null
//             ? []
//             : List<int>.from(json["spare_parts"]!.map((x) => x)),
//       );
//
//   Map<String, dynamic> toJson() => {
//         "quotation_type": quotationType,
//         "service_category": serviceCategory,
//         "description": description,
//         "latitude": latitude,
//         "longitude": longitude,
//         "spare_parts": spareParts == null
//             ? []
//             : List<dynamic>.from(spareParts!.map((x) => x)),
//       };
// }
