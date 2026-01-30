class ResponseModel {
  final bool _status;
  final String _message;
  final dynamic _data;
  // final dynamic _errors;
  ResponseModel(
    this._status,
    this._message,
    this._data,
    // this._errors,
  );

  String get message => _message;
  bool get status => _status;
  dynamic get data => _data;
  // dynamic get errors => _errors;
}
