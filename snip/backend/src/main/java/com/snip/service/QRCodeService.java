package com.snip.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageConfig;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * QRCodeService — generates a QR code PNG image for a given URL.
 *
 * Uses Google's ZXing (Zebra Crossing) library.
 *
 * How it works:
 *  1. QRCodeWriter encodes the URL string into a BitMatrix
 *     (a 2D grid of true/false values representing black/white pixels)
 *  2. MatrixToImageWriter converts the BitMatrix into a PNG image
 *  3. We write the PNG bytes to a ByteArrayOutputStream and return them
 *
 * The controller then serves these bytes as image/png response.
 */
@Service
public class QRCodeService {

    private static final int QR_SIZE = 250; // width and height in pixels

    /**
     * Generate a QR code PNG image for the given URL.
     *
     * @param url   the full short URL to encode e.g. https://snip.com/abc123
     * @return      PNG image as byte array
     */
    public byte[] generateQRCode(String url) throws WriterException, IOException {

        // Hints tell ZXing how to encode the QR code
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H); // High error correction
        hints.put(EncodeHintType.MARGIN, 2); // Quiet zone margin around QR code
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");

        // Encode URL into BitMatrix (grid of black/white pixels)
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(url, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

        // Convert BitMatrix to PNG image bytes
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        // Black QR code on white background
        MatrixToImageConfig config = new MatrixToImageConfig(
            0xFF000000, // foreground: black
            0xFFFFFFFF  // background: white
        );

        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream, config);

        return outputStream.toByteArray();
    }
}
