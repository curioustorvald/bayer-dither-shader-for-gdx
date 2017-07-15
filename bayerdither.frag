varying vec4 v_color;
varying vec2 v_texCoords;
uniform sampler2D u_texture;


// "steps" of R, G and B. Must be integer && equal or greater than 2
uniform float rcount = 4.0;
uniform float gcount = 4.0;
uniform float bcount = 4.0;
uniform float acount = 1.0;



int bayer[8][8] = {
{ 0,32, 8,40, 2,34,10,42}, // 8x8 bayer ordered dithering
{48,16,56,24,50,18,58,26}, // pattern. Each input pixel
{12,44, 4,36,14,46, 6,38}, // is scaled to the 0..63 range
{60,28,52,20,62,30,54,22}, // before looking in this table
{ 3,35,11,43, 1,33, 9,41}, // to determine the action
{51,19,59,27,49,17,57,25},
{15,47, 7,39,13,45, 5,37},
{63,31,55,23,61,29,53,21} }; // fun fact: you can calculate bayer value on-the-fly but LUT is faster
float bayerSize = 8.0;
float bayerDivider = bayerSize * bayerSize;


vec4 nearestColour(vec4 incolor) {
    vec4 rgbaCounts = vec4(rcount, gcount, bcount, acount);


    vec4 color = incolor;

    color.r = floor((rgbaCounts.r - 1.0) * color.r + 0.5) / (rgbaCounts.r - 1.0);
    color.g = floor((rgbaCounts.g - 1.0) * color.g + 0.5) / (rgbaCounts.g - 1.0);
    color.b = floor((rgbaCounts.b - 1.0) * color.b + 0.5) / (rgbaCounts.b - 1.0);

    if (rgbaCounts.a >= 2.0) {
        color.a = floor((rgbaCounts.a - 1.0) * color.a + 0.5) / (rgbaCounts.a - 1.0);
    }
    else {
        color.a = 1.0;
    }

    return color;
}

void main(void) {
    float spread = 1.0 / (0.299 * (rcount - 1.0) + 0.587 * (gcount - 1.0) + 0.114 * (bcount - 1.0));  // this spread value is optimised one -- try your own values for various effects!


    // create texture coordinates based on pixelSize //
    vec4 inColor = texture2D(u_texture, v_texCoords);

    vec2 entry = mod(gl_FragCoord.xy, vec2(bayerSize, bayerSize));

    gl_FragColor = nearestColour(inColor + spread * (bayer[int(entry.y)][int(entry.x)] / bayerDivider - 0.5));
    //gl_FragColor = nearestColour(inColor);
}
