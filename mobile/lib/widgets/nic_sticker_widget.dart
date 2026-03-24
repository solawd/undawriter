import 'package:flutter/material.dart';

class NicStickerWidget extends StatelessWidget {
  final Map<String, dynamic> policy;
  final Map<String, dynamic> motorDetails;

  const NicStickerWidget({
    super.key,
    required this.policy,
    required this.motorDetails,
  });

  @override
  Widget build(BuildContext context) {
    const Color nicBlue = Color(0xFF061944);

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 24.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16.0),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            offset: const Offset(0, 4),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          // Header with Download Button
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'NIC Sticker',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: nicBlue,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Downloading NIC Sticker...')),
                    );
                  },
                  icon: const Icon(Icons.download, size: 18),
                  label: const Text('Download'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: nicBlue,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // The Actual Sticker Representation
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.black, width: 2),
              color: Colors.white,
            ),
            child: Stack(
              children: [
                // Watermark
                Positioned.fill(
                  child: Center(
                    child: Opacity(
                      opacity: 0.05,
                      child: Container(
                        width: 150,
                        height: 150,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.black, width: 8),
                        ),
                        child: const Center(
                          child: Text(
                            'NIC',
                            style: TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      // Sticker Header
                      const Center(
                        child: Column(
                          children: [
                            Text(
                              'UndaWriter Insurance Limited',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              textAlign: TextAlign.center,
                            ),
                            Text(
                              'NATIONAL INSURANCE COMMISSION',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Sticker Details
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _buildStickerRow('Car No.', motorDetails['regNumber']?.toString() ?? ''),
                                _buildStickerRow('Make', motorDetails['makeModel']?.toString().split(" ")[0] ?? ''),
                                _buildStickerRow('Model', motorDetails['makeModel']?.toString().split(" ").skip(1).join(" ") ?? motorDetails['year']?.toString() ?? ''),
                                _buildStickerRow('Body', motorDetails['bodyType']?.toString() ?? ''),
                              ],
                            ),
                          ),
                          // QR Code Placeholder
                          Container(
                            width: 60,
                            height: 60,
                            color: Colors.grey[200],
                            alignment: Alignment.center,
                            child: const Icon(Icons.qr_code, size: 40, color: Colors.black54),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: Colors.black),
                      const SizedBox(height: 8),
                      
                      _buildStickerDateRow('Inception Date', policy['startDate'] ?? ''),
                      _buildStickerDateRow('Expiry Date', policy['endDate'] ?? ''),
                      
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Text('Sticker Number : ', style: TextStyle(fontSize: 12)),
                          Text(
                            policy['nicStickerId']?.toString() ?? 'PENDING',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildStickerRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        children: [
          SizedBox(
            width: 60,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontSize: 12)),
                const Text(':', style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStickerDateRow(String label, String dateStr) {
    // Format date nicely if possible, fallback to raw string
    String formattedDate = dateStr;
    try {
       DateTime dt = DateTime.parse(dateStr);
       formattedDate = '${dt.day} ${_getMonthMap(dt.month)} ${dt.year}';
    } catch(e) {
       // Ignore parsing errors, stick to raw
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 4.0),
      child: Row(
        children: [
          SizedBox(
            width: 90,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(label, style: const TextStyle(fontSize: 12)),
                const Text(':', style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            formattedDate.toUpperCase(),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ],
      ),
    );
  }
  
  String _getMonthMap(int month) {
    const map = {
      1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
      7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'
    };
    return map[month] ?? '';
  }
}
