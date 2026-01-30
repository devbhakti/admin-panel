class RegisterTempleBody {
  String? email;
  String? roleId;
  String? name;
  String? phone;
  InstitutionDetails? institutionDetails;

  RegisterTempleBody({
    this.email,
    this.roleId,
    this.name,
    this.phone,
    this.institutionDetails,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['email'] = email;
    data['roleId'] = roleId;
    data['name'] = name;
    data['phone'] = phone;
    if (institutionDetails != null) {
      data["institutionDetails"] = institutionDetails!.toJson();
    }
    return data;
  }
}

class InstitutionDetails {
  String? category;
  String? openingHours;
  String? city;
  String? state;
  String? address;
  List<String>? images;
  String? contactPerson;
  String? contactNumber;
  String? contactEmail;
  String? poojaId;
  String? history;
  String? logoUrl;

  InstitutionDetails({
    this.category,
    this.openingHours,
    this.city,
    this.state,
    this.address,
    this.images,
    this.contactPerson,
    this.contactNumber,
    this.contactEmail,
    this.poojaId,
    this.history,
    this.logoUrl,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['category'] = category;
    data['openingHours'] = openingHours;
    data['city'] = city;
    data['state'] = state;
    data['address'] = address;
    data['images'] = images;
    data['contactPerson'] = contactPerson;
    data['contactNumber'] = contactNumber;
    data['contactEmail'] = contactEmail;
    data['poojaId'] = poojaId;
    data['history'] = history;
    data['logoUrl'] = logoUrl;
    return data;
  }
}
