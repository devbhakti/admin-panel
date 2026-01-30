// // To parse this JSON data, do
// //
// //     final quotationBody = quotationBodyFromJson(jsonString);
//
// import 'dart:convert';
//
// QuotationBody quotationBodyFromJson(String str) =>
//     QuotationBody.fromJson(json.decode(str));
//
// String quotationBodyToJson(QuotationBody data) => json.encode(data.toJson());
//
// class QuotationBody {
//   String? quotationType;
//   String? supportType;
//   String? serviceCategory;
//   String? description;
//   int? estimatedAmount;
//   int? convertedAmount;
//   int? brandId;
//   int? modelId;
//   String? serialNumber;
//   String? quantity;
//   String? serviceType;
//   String? latitude;
//   String? longitude;
//
//   QuotationBody(
//       {this.quotationType,
//       this.supportType,
//       this.serviceCategory,
//       this.description,
//       this.estimatedAmount,
//       this.convertedAmount,
//       this.brandId,
//       this.modelId,
//       this.serialNumber,
//       this.quantity,
//       this.serviceType,
//       this.latitude,
//       this.longitude});
//
//   factory QuotationBody.fromJson(Map<String, dynamic> json) => QuotationBody(
//         quotationType: json["quotation_type"],
//         supportType: json["support_type"],
//         serviceCategory: json["service_category"],
//         description: json["description"],
//         estimatedAmount: json["estimated_amount"],
//         convertedAmount: json["converted_amount"],
//         brandId: json["brand_id"],
//         modelId: json["model_id"],
//         serialNumber: json["serial_number"],
//         quantity: json["quantity"],
//         serviceType: json["service_type"],
//         latitude: json["latitude"],
//         longitude: json["longitude"],
//       );
//
//   Map<String, dynamic> toJson() => {
//         "service_type": serviceType,
//         "quotation_type": quotationType,
//         "support_type": supportType,
//         "service_category": serviceCategory,
//         "description": description,
//         "estimated_amount": estimatedAmount,
//         "converted_amount": convertedAmount,
//         "brand_id": brandId,
//         "model_id": modelId,
//         "serial_number": serialNumber,
//         "quantity": quantity,
//         "latitude": latitude,
//         "longitude": longitude,
//       };
// }

// To parse this JSON data, do
//
//     final quotationBody = quotationBodyFromJson(jsonString);

import 'dart:convert';

QuotationBody quotationBodyFromJson(String str) =>
    QuotationBody.fromJson(json.decode(str));

String quotationBodyToJson(QuotationBody data) => json.encode(data.toJson());

class QuotationBody {
  String? quotationType;
  String? supportType;
  String? description;
  int? estimatedAmount;
  int? convertedAmount;
  int? slatypeId;
  String? latitude;
  String? longitude;
  List<Model>? models;
  String? serialNumber;
  String? quantity;
  String? serviceType;
  String? country;

  QuotationBody({
    this.quotationType,
    this.supportType,
    this.description,
    this.estimatedAmount,
    this.convertedAmount,
    this.slatypeId,
    this.latitude,
    this.longitude,
    this.models,
    this.serialNumber,
    this.quantity,
    this.serviceType,
    this.country,
  });

  factory QuotationBody.fromJson(Map<String, dynamic> json) => QuotationBody(
        quotationType: json["quotation_type"],
        supportType: json["support_type"],
        country: json["country"],
        description: json["description"],
        estimatedAmount: json["estimated_amount"],
        convertedAmount: json["converted_amount"],
        slatypeId: json["slatype_id"],
        latitude: json["latitude"]?.toDouble(),
        longitude: json["longitude"]?.toDouble(),
        models: json["models"] == null
            ? []
            : List<Model>.from(json["models"]!.map((x) => Model.fromJson(x))),
        serialNumber: json["serial_number"],
        quantity: json["quantity"],
        serviceType: json["service_type"],
      );

  Map<String, dynamic> toJson() => {
        "quotation_type": quotationType,
        "support_type": supportType,
        "description": description,
        "estimated_amount": estimatedAmount,
        "converted_amount": convertedAmount,
        "slatype_id": slatypeId,
        "latitude": latitude,
        "longitude": longitude,
        "models": models == null
            ? []
            : List<dynamic>.from(models!.map((x) => x.toJson())),
        "serial_number": serialNumber,
        "quantity": quantity,
        "service_type": serviceType,
        "country": country,
      };
}

class Model {
  int? id;
  int? quantity;

  Model({
    this.id,
    this.quantity,
  });

  factory Model.fromJson(Map<String, dynamic> json) => Model(
        id: json["id"],
        quantity: json["quantity"],
      );

  Map<String, dynamic> toJson() => {
        "id": id,
        "quantity": quantity,
      };
}
