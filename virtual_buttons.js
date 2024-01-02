const virtual_buttons = {
    size : 2,
    points:[ [0,0,10,6] , [20,0,10,6] ],
    // 0: 通常状態のカラー      1:押されている状態のカラー
    colors:['rgba(100, 100, 100, 0.3)' , 'rgba(255, 100, 0, 0.3)'] ,
    width:30,
    height:20,
    draw_grid : function() {
        // Canvas要素を取得
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');        
        
        for(let i = 0;i < this.width;i++){
            let x = i * canvas.width / this.width;

            // パスの開始
            context.beginPath();
            // 線の開始位置
            context.moveTo(x, 0);
            // 開始以降の線の位置
            context.lineTo(x, canvas.height);
            // パスを閉じる
            context.closePath();
            context.stroke();
        }
        for(let i = 0;i < this.height;i++){
            let y = i * canvas.height/ this.height;

            // パスの開始
            context.beginPath();
            // 線の開始位置
            context.moveTo(0,y);
            // 開始以降の線の位置
            context.lineTo(canvas.width , y);
            // パスを閉じる
            context.closePath();
            context.stroke();
        }
    },
    draw : function (keypoints){
        // Canvas要素を取得
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d');

        // 点を描画
        for(let i = 0;i < this.size;i++){
            context.fillStyle = this.colors[0];
            let x   = this.points[i][0] * canvas.width / this.width;
            let y   = this.points[i][1] * canvas.height/ this.height;
            let l1  = this.points[i][2] * canvas.width / this.width;
            let l2  = this.points[i][3] * canvas.height / this.height;  
            
            for(let pnt of keypoints){
                if( x <= pnt.x && pnt.x <= x + l1 && y <= pnt.y && pnt.y <= y + l2){
                    context.fillStyle = this.colors[1];
                    console.log(pnt.name);
                    break;
                } 
            }

            x = canvas.width - x - l1;

            context.fillRect(x,y,l1,l2);
        }
    }
}

export default virtual_buttons;