import 'package:devbhakti/theme/color.dart';
import 'package:devbhakti/views/splash/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

import 'helper/get_di.dart';

void main()async {
 await init();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(debugShowCheckedModeBanner: false,
      theme: themeData,
      home: const SplashScreen()
    );
  }
}

