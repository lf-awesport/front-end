'use client'

import Image from "next/image";
import styles from "../app/page.module.css";
import { useState, useEffect } from 'react'



export const Carousel = ({defaultHeadline, defaultContent}) => {
  const [headline, setHeadline] = useState(null)
  const [content, setContent] = useState(null)
  const [isLoading, setLoading] = useState(true)
  const [isEditing, setEditing] = useState(false)

     useEffect(() => {
      setHeadline(defaultHeadline)
      setContent(defaultContent)
      setLoading(false)
  }, [])

      if (isLoading) return <p>Loading...</p>
      if (!headline) return <p>No profile data</p>

        return <div className={styles.carouselContainer}>
          <div className={styles.carousel} >
        <Image
              src="/LOGO-POS.png"
              alt="awe Logo"
              className={styles.aweLogo}
              width={778}
              height={221}
            />
          {(isEditing? 

        <div className={styles.carouselText}>
         <textarea className={styles.carouselHeadline} value={headline} onChange={(e) => setHeadline(e.target.value)}/>
         <textarea className={styles.carouselContent} value={content} onChange={(e) => setContent(e.target.value)}/>
        </div>

          :<div className={styles.carouselText}>
         <p className={styles.carouselHeadline}>{headline}</p>
         <p className={styles.carouselContent}>{content}</p>
        </div>)}
         
            </div>
            <div className={styles.buttonContainer}>
          <button className={styles.carouselButton} onClick={() => setEditing(!isEditing)}>{(isEditing? "Save":"Edit")}</button>
          {(isEditing? <button className={styles.carouselButton} onClick={() => {setHeadline(defaultHeadline); setContent(defaultContent)}}>Undo</button> : null)}
          </div>
        </div>
         
    }
