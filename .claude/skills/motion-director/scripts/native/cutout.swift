// Lift the subject(s) out of a photo with Apple's Vision framework (macOS 14+):
// writes a PNG with alpha, cropped to the subject. No downloads, no cloud.
//   swift cutout.swift <in.jpg|png> <out.png> [--instance N]
import Foundation
import Vision
import CoreImage
import AppKit

let a = CommandLine.arguments
guard a.count >= 3 else { print("usage: cutout <in> <out> [--instance N]"); exit(2) }
let url = URL(fileURLWithPath: a[1])
guard let ci = CIImage(contentsOf: url) else { print("cannot read \(a[1])"); exit(1) }
let req = VNGenerateForegroundInstanceMaskRequest()
let h = VNImageRequestHandler(ciImage: ci)
do { try h.perform([req]) } catch { print("vision failed: \(error)"); exit(1) }
guard let r = req.results?.first, !r.allInstances.isEmpty else { print("no subject found"); exit(3) }
var inst = r.allInstances
if let i = a.firstIndex(of: "--instance"), i + 1 < a.count, let n = Int(a[i + 1]), inst.contains(n) { inst = IndexSet(integer: n) }
let buf = try! r.generateMaskedImage(ofInstances: inst, from: h, croppedToInstancesExtent: true)
let out = CIImage(cvPixelBuffer: buf)
let ctx = CIContext()
try! ctx.writePNGRepresentation(of: out, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("\(a[2]) \(Int(out.extent.width))x\(Int(out.extent.height)) instances \(r.allInstances.count)")
