import 'package:flutter/material.dart';
import 'package:undawriter_insure/widgets/nic_sticker_widget.dart';

class PolicyDetailScreen extends StatelessWidget {
  final Map<String, dynamic> policy;

  const PolicyDetailScreen({Key? key, required this.policy}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final policyData = policy['policy'] ?? {};
    final motorDetails = policy['motorDetails'];
    
    final productType = policyData['productType']?.toString() ?? 'UNKNOWN';

    String vehicleOrProperty = '';
    if (productType == 'MOTOR' && motorDetails != null) {
      final makeModel = motorDetails['makeModel']?.toString() ?? 'Unknown Vehicle';
      final regNo = motorDetails['regNumber']?.toString() ?? 'No Reg';
      vehicleOrProperty = '$makeModel ($regNo)';
    } else if (policyData['property'] != null) {
      vehicleOrProperty = policyData['property'].toString();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Policy Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Image.asset(
                'assets/logo/UndaWriterLogo.png',
                height: 60,
              ),
            ),
            const SizedBox(height: 24),
            if (productType == 'MOTOR' && policyData['nicStickerId'] != null)
               NicStickerWidget(
                  policy: policyData,
                  motorDetails: motorDetails ?? {},
               ),
            _buildInfoCard(context, 'Coverage Summary', [
              _buildRow('Policy Number', policyData['id']?.toString() ?? ''),
              _buildRow('Status', policyData['status']?.toString() ?? 'PENDING', isStatus: true),
              _buildRow('Coverage Type', '$productType INSURANCE'),
              if (vehicleOrProperty.isNotEmpty) 
                _buildRow(productType == 'MOTOR' ? 'Vehicle' : 'Property', vehicleOrProperty),
            ]),
            const SizedBox(height: 16),
            _buildInfoCard(context, 'Payment Receipt', [
              _buildRow('Start Date', policyData['startDate']?.toString() ?? ''),
              _buildRow('End Date', policyData['endDate']?.toString() ?? ''),
              const Divider(),
              _buildRow('Premium Paid', 'GHS ${policyData['premiumNet']?.toString() ?? '0.00'}', isBold: true),
            ]),
            const SizedBox(height: 48),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 0),
              child: ElevatedButton.icon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Downloading digital sticker/certificate...')),
                  );
                },
                icon: const Icon(Icons.file_download),
                label: const Text('Download Certificate'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF061944),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, String title, List<Widget> children) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: const Color(0xFF061944),
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 16),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value, {bool isStatus = false, bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          if (isStatus)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(value, style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 12)),
            )
          else
            Text(
              value,
              style: TextStyle(
                fontWeight: isBold ? FontWeight.bold : FontWeight.w500,
                fontSize: isBold ? 16 : 14,
                color: isBold ? const Color(0xFF061944) : Colors.black87,
              ),
            ),
        ],
      ),
    );
  }
}
