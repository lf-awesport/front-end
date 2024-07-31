import Image from "next/image";
import styles from "../app/page.module.css";



export const Carousel = ({headline, content}) => {

        return <div className={styles.carousel} >
        <Image
              src="/LOGO-POS.png"
              alt="awe Logo"
              className={styles.aweLogo}
              width={778}
              height={221}
            />

        <div className={styles.carouselText}>
        <p className={styles.carouselHeadline}>{headline}</p>
        <p className={styles.carouselContent}>{content}</p>
        </div>
        
            
            </div> 
    }
