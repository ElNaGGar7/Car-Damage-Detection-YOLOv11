// ─────────────────────────────────────────────
// 🤖 ملف الموديل — YOLOv8 Car Damage Detection
// بيشتغل بـ Python subprocess من جوة الـ API
// ─────────────────────────────────────────────

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const YOLO_SCRIPT = '/home/z/my-project/yolo-analyze.py';

interface YOLOResult {
  success: boolean;
  damages: Array<{
    type: string;
    severity: string;
    location: string;
    description: string;
    estimatedCost: number;
    confidence: number;
  }>;
  totalCost: number;
}

export async function analyzeCarDamage(
  imageBase64: string,
  _carName: string,
  _carModel: string,
  _carYear: string
): Promise<string> {
  const inputJson = JSON.stringify({ image: imageBase64 });

  const { stdout, stderr } = await execFileAsync('python3', [YOLO_SCRIPT], {
    maxBuffer: 10 * 1024 * 1024, // 10MB
    input: inputJson,
    timeout: 60000, // 60 seconds
    env: {
      ...process.env,
      ULTRALYTICS_CONFIG_DIR: '/tmp/Ultralytics',
    },
  });

  if (stderr) {
    console.log('[YOLO stderr]:', stderr);
  }

  const result: YOLOResult = JSON.parse(stdout.trim());

  if (result.success && result.damages.length > 0) {
    return JSON.stringify(result.damages);
  }

  throw new Error('No damages detected by YOLO model');
}
