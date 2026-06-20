export interface PostcardData {
  levelName: string;
  creatureName: string;
  creatureDescription: string;
  timeSeconds: number;
  completionDate: Date;
  canvas: HTMLCanvasElement;
}

export class PostcardExporter {
  private static readonly POSTCARD_WIDTH = 1200;
  private static readonly POSTCARD_HEIGHT = 1600;
  private static readonly CANVAS_SIZE = 1000;

  static async createPostcard(data: PostcardData): Promise<HTMLCanvasElement> {
    const postcard = document.createElement('canvas');
    postcard.width = this.POSTCARD_WIDTH;
    postcard.height = this.POSTCARD_HEIGHT;
    const ctx = postcard.getContext('2d');
    if (!ctx) throw new Error('Failed to get postcard context');

    this.drawBackground(ctx);
    this.drawDecorativeBorder(ctx);
    this.drawGameCanvas(ctx, data.canvas);
    this.drawTextContent(ctx, data);
    this.drawSignature(ctx);

    return postcard;
  }

  private static drawBackground(ctx: CanvasRenderingContext2D): void {
    const w = this.POSTCARD_WIDTH;
    const h = this.POSTCARD_HEIGHT;

    const bgGradient = ctx.createLinearGradient(0, 0, 0, h);
    bgGradient.addColorStop(0, '#050816');
    bgGradient.addColorStop(0.5, '#0a0f2e');
    bgGradient.addColorStop(1, '#050816');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, w, h);

    const centerGlow = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, 600);
    centerGlow.addColorStop(0, 'rgba(100, 120, 255, 0.08)');
    centerGlow.addColorStop(0.5, 'rgba(60, 80, 180, 0.04)');
    centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, w, h);

    this.drawStarField(ctx, 150);
  }

  private static drawStarField(ctx: CanvasRenderingContext2D, count: number): void {
    const w = this.POSTCARD_WIDTH;
    const h = this.POSTCARD_HEIGHT;
    const colors = ['#ffffff', '#a0c4ff', '#ffd700', '#ffb6c1'];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 2 + 0.5;
      const brightness = Math.random() * 0.6 + 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)];

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = color + this.alphaToHex(brightness);
      ctx.fill();

      if (size > 1.5 && Math.random() > 0.7) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        glow.addColorStop(0, color + this.alphaToHex(brightness * 0.3));
        glow.addColorStop(1, color + '00');
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }
  }

  private static drawDecorativeBorder(ctx: CanvasRenderingContext2D): void {
    const w = this.POSTCARD_WIDTH;
    const h = this.POSTCARD_HEIGHT;
    const padding = 40;
    const cornerSize = 60;

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
    ctx.lineWidth = 2;

    const drawCorner = (x: number, y: number, dx: number, dy: number) => {
      ctx.beginPath();
      ctx.moveTo(x + dx * cornerSize, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + dy * cornerSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + dx * (cornerSize + 15), y + dy * 8);
      ctx.lineTo(x + dx * 8, y + dy * 8);
      ctx.lineTo(x + dx * 8, y + dy * (cornerSize + 15));
      ctx.strokeStyle = 'rgba(160, 196, 255, 0.3)';
      ctx.stroke();
    };

    drawCorner(padding, padding, 1, 1);
    drawCorner(w - padding, padding, -1, 1);
    drawCorner(padding, h - padding, 1, -1);
    drawCorner(w - padding, h - padding, -1, -1);

    ctx.strokeStyle = 'rgba(100, 150, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 10]);
    ctx.strokeRect(padding + 20, padding + 20, w - padding * 2 - 40, h - padding * 2 - 40);
    ctx.setLineDash([]);
  }

  private static drawGameCanvas(ctx: CanvasRenderingContext2D, gameCanvas: HTMLCanvasElement): void {
    const w = this.POSTCARD_WIDTH;
    const canvasTop = 180;
    const framePadding = 20;

    const frameGradient = ctx.createLinearGradient(
      w / 2 - this.CANVAS_SIZE / 2 - framePadding,
      canvasTop - framePadding,
      w / 2 + this.CANVAS_SIZE / 2 + framePadding,
      canvasTop + this.CANVAS_SIZE + framePadding
    );
    frameGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
    frameGradient.addColorStop(0.5, 'rgba(160, 196, 255, 0.2)');
    frameGradient.addColorStop(1, 'rgba(255, 215, 0, 0.3)');

    ctx.fillStyle = frameGradient;
    ctx.fillRect(
      w / 2 - this.CANVAS_SIZE / 2 - framePadding,
      canvasTop - framePadding,
      this.CANVAS_SIZE + framePadding * 2,
      this.CANVAS_SIZE + framePadding * 2
    );

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      w / 2 - this.CANVAS_SIZE / 2 - framePadding,
      canvasTop - framePadding,
      this.CANVAS_SIZE + framePadding * 2,
      this.CANVAS_SIZE + framePadding * 2
    );

    ctx.fillStyle = '#02030a';
    ctx.fillRect(w / 2 - this.CANVAS_SIZE / 2, canvasTop, this.CANVAS_SIZE, this.CANVAS_SIZE);

    ctx.save();
    ctx.beginPath();
    ctx.rect(w / 2 - this.CANVAS_SIZE / 2, canvasTop, this.CANVAS_SIZE, this.CANVAS_SIZE);
    ctx.clip();

    const sourceSize = Math.min(gameCanvas.width, gameCanvas.height);
    const sourceX = (gameCanvas.width - sourceSize) / 2;
    const sourceY = (gameCanvas.height - sourceSize) / 2;

    ctx.drawImage(
      gameCanvas,
      sourceX, sourceY, sourceSize, sourceSize,
      w / 2 - this.CANVAS_SIZE / 2, canvasTop, this.CANVAS_SIZE, this.CANVAS_SIZE
    );

    ctx.restore();

    const innerGlow = ctx.createRadialGradient(
      w / 2, canvasTop + this.CANVAS_SIZE / 2, this.CANVAS_SIZE * 0.3,
      w / 2, canvasTop + this.CANVAS_SIZE / 2, this.CANVAS_SIZE * 0.7
    );
    innerGlow.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerGlow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = innerGlow;
    ctx.fillRect(w / 2 - this.CANVAS_SIZE / 2, canvasTop, this.CANVAS_SIZE, this.CANVAS_SIZE);
  }

  private static drawTextContent(ctx: CanvasRenderingContext2D, data: PostcardData): void {
    const w = this.POSTCARD_WIDTH;
    const centerX = w / 2;
    const textTop = 1280;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.font = 'bold 80px "Microsoft YaHei", serif';
    ctx.fillText('✦', centerX, textTop - 80);

    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 20;
    ctx.font = 'bold 52px "Microsoft YaHei", sans-serif';
    ctx.fillText(`${data.creatureName} · 降临`, centerX, textTop);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#a0c4ff';
    ctx.font = '28px "Microsoft YaHei", sans-serif';
    ctx.fillText(`星座：${data.levelName}`, centerX, textTop + 80);

    const timeStr = this.formatTime(data.timeSeconds);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px "Microsoft YaHei", sans-serif';
    ctx.fillText(`通关用时：${timeStr}`, centerX, textTop + 130);

    const dateStr = this.formatDate(data.completionDate);
    ctx.fillStyle = '#8899bb';
    ctx.font = '20px "Microsoft YaHei", sans-serif';
    ctx.fillText(dateStr, centerX, textTop + 175);

    this.drawDivider(ctx, textTop + 220);

    const desc = data.creatureDescription;
    const wrappedLines = this.wrapText(desc, 900, 22);
    ctx.fillStyle = '#c8d8ff';
    ctx.font = '22px "Microsoft YaHei", sans-serif';
    wrappedLines.forEach((line, i) => {
      ctx.fillText(line, centerX, textTop + 260 + i * 36);
    });
  }

  private static drawDivider(ctx: CanvasRenderingContext2D, y: number): void {
    const w = this.POSTCARD_WIDTH;
    const centerX = w / 2;
    const lineWidth = 300;

    const gradient = ctx.createLinearGradient(centerX - lineWidth, y, centerX + lineWidth, y);
    gradient.addColorStop(0, 'rgba(160, 196, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(160, 196, 255, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - lineWidth, y);
    ctx.lineTo(centerX + lineWidth, y);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.font = '16px serif';
    ctx.fillText('✧', centerX, y - 8);
  }

  private static drawSignature(ctx: CanvasRenderingContext2D): void {
    const w = this.POSTCARD_WIDTH;
    const h = this.POSTCARD_HEIGHT;

    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(160, 196, 255, 0.4)';
    ctx.font = '18px "Microsoft YaHei", sans-serif';
    ctx.fillText('✦ 星界神话 · 星座明信片 ✦', w / 2, h - 60);
  }

  static downloadPostcard(postcard: HTMLCanvasElement, filename?: string): void {
    const link = document.createElement('a');
    link.download = filename || `星座明信片_${Date.now()}.png`;
    link.href = postcard.toDataURL('image/png', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs}秒`;
    }
    return `${secs}秒`;
  }

  private static formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }

  private static wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [text];

    ctx.font = `${fontSize}px "Microsoft YaHei", sans-serif`;
    
    const lines: string[] = [];
    let currentLine = '';
    
    for (const char of text) {
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  private static alphaToHex(alpha: number): string {
    const clamped = Math.max(0, Math.min(1, alpha));
    return Math.round(clamped * 255).toString(16).padStart(2, '0');
  }
}
