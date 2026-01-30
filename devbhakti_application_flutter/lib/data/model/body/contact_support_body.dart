// To parse this JSON data, do
//
//     final contactSupportBody = contactSupportBodyFromJson(jsonString);

import 'dart:convert';

ContactSupportBody contactSupportBodyFromJson(String str) =>
    ContactSupportBody.fromJson(json.decode(str));

String contactSupportBodyToJson(ContactSupportBody data) =>
    json.encode(data.toJson());

class ContactSupportBody {
  String? name;
  String? contact;
  String? subject;
  String? description;
  String? userId;

  ContactSupportBody({
    this.name,
    this.contact,
    this.subject,
    this.description,
    this.userId,
  });

  factory ContactSupportBody.fromJson(Map<String, dynamic> json) =>
      ContactSupportBody(
        name: json["name"],
        subject: json["subject"],
        description: json["description"],
        userId: json["user_id"],
      );

  Map<String, dynamic> toJson() => {
        "name": name,
        "contact": contact,
        "subject": subject,
        "description": description,
        "user_id": userId,
      };
}
