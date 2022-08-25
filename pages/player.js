import { isMobile } from "react-device-detect"
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react'
import { fabric } from "fabric"
import dynamic from 'next/dynamic'
import styles from '../styles/Player.module.css'

const ReactHlsPlayer = dynamic(() => import("react-hls-player"), {
  ssr: false,
})

let fab_canvas = null
let fab_video = null
let fab_sample_text = null

const ORIGINALWIDTH = 1024, ORIGINALHEIGHT = 768
const mediaLink = "./fc4caf9b-05df-47a0-8623-e608f80ffef9/playlist.m3u8"
let playing = true
const STARTTIME = 3
const ENDTIME = 10

export default function Home() {
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const animationContainerRef = useRef(null)

  useEffect(() => {
    const _w = ORIGINALWIDTH
    const _h = _w * 9 / 16
    fab_canvas = new fabric.Canvas("sCanvas", {
      width: _w,
      height: _h,
      zoom: _w / ORIGINALWIDTH,
      backgroundColor: "green",
      preserveObjectStacking: true,
      hoverCursor: 'pointer',
      renderOnAddRemove: false,
      selectable: true,
      evented: true,
    })

    fab_canvas.on('mouse:up', function (options) {
      if (playing)
        playerRef.current.pause()
      else
        playerRef.current.play()
      playing = !playing
    })

  }, [])

  const handleVideoReady = (v) => {
    if (fab_video === null) {
      fab_video = new fabric.Image(v.target, {
        id: "video",
        selectable: true,
        evented: true,
        left: 0,
        top: 0,

        width: ORIGINALWIDTH,
        height: ORIGINALWIDTH * 9 / 16,
        scaleX: ORIGINALWIDTH / v.target.videoWidth,
        scaleY: ORIGINALWIDTH / v.target.videoWidth,
        objectCaching: true,
        statefullCache: true,
      })
      fab_canvas.add(fab_video)


      fabric.util.requestAnimFrame(function render() {
        let _realCurrentTime = playerRef.current.currentTime
        // console.log('render', _realCurrentTime)
        if (_realCurrentTime >= STARTTIME && _realCurrentTime <= ENDTIME) {
          if (fab_sample_text == null) {
            fab_sample_text = new fabric.Text("Sample Text", {
              id: "sample_text",
              selectable: true,
              evented: true,
              left: ORIGINALWIDTH / 2,
              top: 200,
              originX: 'center',
              originY: 'center',
              width: 100,
              height: 300,
              fill: 'white',
              objectCaching: true,
              statefullCache: true,
              fontSize: 80,
            })
            fab_canvas.add(fab_sample_text)
          }
        } else {
          fab_canvas.getObjects().forEach((obj) => {
            if (obj.id.indexOf("sample_text") > -1)
              fab_canvas.remove(obj)
          })
          fab_sample_text = null
        }
        fab_canvas.renderAll()
        fabric.util.requestAnimFrame(render)
      })
    }
  }
  return (
    <div className={styles.backContainer} ref={containerRef}>
      <div className={styles.animationContainer} ref={animationContainerRef}>
        <img alt='' crossOrigin='anonymous' id='animationImg' />
        <canvas id="sCanvas" />
        <ReactHlsPlayer
          playerRef={playerRef}
          width={"500px"}
          height={"500px"}
          autoPlay={true}
          muted
          playsInline
          controls={true}
          src={mediaLink}
          onLoadedData={handleVideoReady}
          onEnded={() => {
            playing = false
          }}
        />
      </div>
    </div >
  )
}
