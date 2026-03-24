import 'package:flutter/material.dart';
import 'package:undawriter_insure/theme.dart';
import 'package:undawriter_insure/screens/login_screen.dart';

void main() {
  runApp(const UndaWriterInsureApp());
}

class UndaWriterInsureApp extends StatelessWidget {
  const UndaWriterInsureApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'UndaWriter Insure',
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}
