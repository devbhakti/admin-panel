import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Button2 extends StatelessWidget {
  final IconData icon;
  final String title;
  final Function onTap;
  const Button2(
      {Key? key, required this.title, required this.icon, required this.onTap})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {
        onTap();
      },
      child: Center(
        child: Container(
          height: 60,
          width: MediaQuery.of(context).size.width > 500
              ? (Get.width / 2) * 1.3
              : Get.width,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.black12),
            borderRadius: BorderRadius.circular(8),
            color: Colors.white,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Icon(
                icon,
                color: Colors.black,
                size: 28,
              ),
              const SizedBox(
                width: 12,
              ),
              Text(
                title,
                style: const TextStyle(
                    color: Colors.black,
                    fontSize: 16,
                    fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              const Icon(
                Icons.chevron_right,
                color: Colors.black,
                size: 30,
              )
            ],
          ),
        ),
      ),
    );
  }
}
