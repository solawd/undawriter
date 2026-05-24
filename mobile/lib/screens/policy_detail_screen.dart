import 'package:flutter/material.dart';
import 'package:undawriter_insure/widgets/nic_sticker_widget.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:undawriter_insure/services/api_service.dart';

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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (policyData['policyDocumentUrl'] != null && policyData['policyDocumentUrl'].toString().isNotEmpty)
                    ElevatedButton.icon(
                      onPressed: () async {
                        final fullUrl = '${ApiService.baseUrl}${policyData['policyDocumentUrl']}';
                        final uri = Uri.parse(fullUrl);
                        try {
                          final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
                          if (!launched) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Could not open policy document link.')),
                            );
                          }
                        } catch(e) {
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Could not open policy document link.')),
                          );
                        }
                      },
                      icon: const Icon(Icons.description),
                      label: const Text('Download Policy Document'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF061944),
                        side: const BorderSide(color: Color(0xFF061944)),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                  if (policyData['policyDocumentUrl'] != null && policyData['stickerDocumentUrl'] != null)
                    const SizedBox(height: 16),
                  if (policyData['stickerDocumentUrl'] != null && policyData['stickerDocumentUrl'].toString().isNotEmpty)
                    ElevatedButton.icon(
                      onPressed: () async {
                        final fullUrl = '${ApiService.baseUrl}${policyData['stickerDocumentUrl']}';
                        final uri = Uri.parse(fullUrl);
                        try {
                          final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
                          if (!launched) {
                            if (!context.mounted) return;
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Could not open sticker link.')),
                            );
                          }
                        } catch(e) {
                          if (!context.mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Could not open sticker link.')),
                          );
                        }
                      },
                      icon: const Icon(Icons.file_download),
                      label: const Text('Download Sticker'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF061944),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
                ],
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
