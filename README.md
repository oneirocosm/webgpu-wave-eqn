# webgpu-wave-eqn
This is a simple 2d wave equation simulator.  When the user clicks on the window, energy will be introduced to the system which will bounce off the walls that were loaded in via a texture.

Since this program was created using WebGPU (which is still unstable), it is experimental and only works on the [Chrome Canary](https://www.google.com/chrome/canary/) browser with [WebGPU enabled](https://developer.chrome.com/en/docs/web-platform/webgpu/#enabling-via-aboutflags).

## Big Picture Idea
![demonstration](https://user-images.githubusercontent.com/107814465/220036078-e6cf061a-0a8d-4146-88cf-7c49e4ef1712.gif)

As stated above, this is a 2d wave equation simulator that allows for
- Arbitrary walls by importing textures
- Arbitrary energies in the form of user-submitted clicks

While there are still many limitations in the application, it can create various simulations for arbitrary background walls and clicks.  To do this, it uses the WebGPU library to send relevant data to the GPU where the actual calculations are being performed.  From here, a finite difference approximation of the wave equation is used to compute the next value for each point on a grid of finite differences (currently represented by pixels).

$$\begin{equation} u(x,y,t + \Delta t) = \frac{v^2(\Delta t)^2}{(\Delta s)^2} \Big[ u(x + \Delta x, y, t) + u(x - \Delta x, y, t) + u(x, y + \Delta y, t) + u(x, y - \Delta y, t) -4u(x, y, z) \Big] + 2u(x,y,t) - u(x, y, t - \Delta t) \end{equation}$$

For boundary conditions, any point that is clicked has the energy increased, and any point that is a wall always has zero energy.  And this repeats each cycle.

## Big Picture Presentation
If you'd like to see a more visual explanation of the above, here is a presentation I gave toward the end of my batch at the [Recurse Center](https://www.recurse.com/)!  If you want an uncompressed version, you can also find that in this repository at [/WavePresentation.mp4](/WavePresentation.mp4).




https://user-images.githubusercontent.com/107814465/220040152-fa7a79b4-a22e-4dcb-8164-601c94eca4ce.mp4

(note: about 8:50 in, I erroneously say "j times the height."  I should have just said "j" as the equation on the screen does)


## How to Run
Using pnpm run dev, you can serve this simulation in your webbrowser at http://localhost:8080.  That being said, there are a few other important details to keep in mind:
- Due to WebGPU still being unstable, this can currently only run in Chrome Canary with the WebGPU flags enabled
- Background images need to be added to /dist/img/ (these are not currently included in the repository)
- If you wish to change the image in use, you currently need to change the hard-coded file name in [/src/renderer.ts](/src/renderer.ts)
- If you wish to increase or decrease the amount of energy introduced by a click, you can do so in [/src/energies.ts](/src/energies.ts)

## Future Improvements
The basic functionality of the app is there, but there are a lot of improvements that could be made:
- [ ] A vertex-based grid instead of a pixel-based one
- [ ] More configurations options
- [ ] The ability to upload a wall texture from the page
- [ ] Click and Hold for bigger wave
- [ ] Click and drag for moving source
- [ ] Configurable options such as canvas size and wave speed
- [ ] Different boundary conditions at edges
