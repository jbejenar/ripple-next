import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RplCarousel from '../components/molecules/RplCarousel.vue'

const sampleItems = [
  {
    image: { src: '/slide1.jpg', alt: 'Slide 1 image' },
    title: 'Slide One',
    content: 'Content for slide one',
    link: { url: '/page-1', label: 'Learn more' }
  },
  {
    image: { src: '/slide2.jpg', alt: 'Slide 2 image' },
    title: 'Slide Two',
    content: 'Content for slide two'
  },
  {
    image: { src: '/slide3.jpg', alt: 'Slide 3 image' },
    title: 'Slide Three'
  }
]

describe('RplCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all carousel items', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides).toHaveLength(3)
  })

  it('shows only the first slide as active by default', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[0].classes()).toContain('rpl-carousel__slide--active')
    expect(slides[1].classes()).not.toContain('rpl-carousel__slide--active')
    expect(slides[2].classes()).not.toContain('rpl-carousel__slide--active')
  })

  it('advances to next slide when next button is clicked', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    await wrapper.find('.rpl-carousel__nav--next').trigger('click')
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[1].classes()).toContain('rpl-carousel__slide--active')
    expect(slides[0].classes()).not.toContain('rpl-carousel__slide--active')
  })

  it('goes to previous slide when prev button is clicked', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    await wrapper.find('.rpl-carousel__nav--next').trigger('click')
    await wrapper.find('.rpl-carousel__nav--prev').trigger('click')
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[0].classes()).toContain('rpl-carousel__slide--active')
  })

  it('wraps from last slide to first on next', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    await wrapper.find('.rpl-carousel__nav--next').trigger('click')
    await wrapper.find('.rpl-carousel__nav--next').trigger('click')
    await wrapper.find('.rpl-carousel__nav--next').trigger('click')
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[0].classes()).toContain('rpl-carousel__slide--active')
  })

  it('wraps from first slide to last on prev', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    await wrapper.find('.rpl-carousel__nav--prev').trigger('click')
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[2].classes()).toContain('rpl-carousel__slide--active')
  })

  it('renders dot indicators for each slide', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const dots = wrapper.findAll('.rpl-carousel__dot')
    expect(dots).toHaveLength(3)
  })

  it('marks the correct dot as active', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const dots = wrapper.findAll('.rpl-carousel__dot')
    expect(dots[0].classes()).toContain('rpl-carousel__dot--active')
    expect(dots[1].classes()).not.toContain('rpl-carousel__dot--active')
  })

  it('navigates to slide when dot indicator is clicked', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const dots = wrapper.findAll('.rpl-carousel__dot')
    await dots[2].trigger('click')
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[2].classes()).toContain('rpl-carousel__slide--active')
  })

  it('dot indicators have aria-selected attribute', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const dots = wrapper.findAll('.rpl-carousel__dot')
    expect(dots[0].attributes('aria-selected')).toBe('true')
    expect(dots[1].attributes('aria-selected')).toBe('false')
  })

  it('navigates with ArrowRight key', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    await wrapper.find('.rpl-carousel').trigger('keydown', { key: 'ArrowRight' })
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[1].classes()).toContain('rpl-carousel__slide--active')
  })

  it('navigates with ArrowLeft key', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    await wrapper.find('.rpl-carousel').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.find('.rpl-carousel').trigger('keydown', { key: 'ArrowLeft' })
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[0].classes()).toContain('rpl-carousel__slide--active')
  })

  it('automatically advances slides when autoplay is true', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems, autoplay: true, interval: 1000 }
    })
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[1].classes()).toContain('rpl-carousel__slide--active')
  })

  it('does not autoplay when autoplay prop is false', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems, autoplay: false, interval: 1000 }
    })
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[0].classes()).toContain('rpl-carousel__slide--active')
  })

  it('pauses autoplay on mouse hover', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems, autoplay: true, interval: 1000 }
    })
    await wrapper.find('.rpl-carousel').trigger('mouseenter')
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[0].classes()).toContain('rpl-carousel__slide--active')
  })

  it('resumes autoplay when mouse leaves', async () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems, autoplay: true, interval: 1000 }
    })
    await wrapper.find('.rpl-carousel').trigger('mouseenter')
    await wrapper.find('.rpl-carousel').trigger('mouseleave')
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    const slides = wrapper.findAll('.rpl-carousel__slide')
    expect(slides[1].classes()).toContain('rpl-carousel__slide--active')
  })

  it('has role="region" on the carousel', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    expect(wrapper.find('.rpl-carousel').attributes('role')).toBe('region')
  })

  it('has aria-roledescription="carousel"', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    expect(wrapper.find('.rpl-carousel').attributes('aria-roledescription')).toBe('carousel')
  })

  it('has aria-label on the carousel', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    expect(wrapper.find('.rpl-carousel').attributes('aria-label')).toBeTruthy()
  })

  it('renders slide images with correct src and alt', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const images = wrapper.findAll('.rpl-carousel__img')
    expect(images[0].attributes('src')).toBe('/slide1.jpg')
    expect(images[0].attributes('alt')).toBe('Slide 1 image')
  })

  it('renders slide titles', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    expect(wrapper.find('.rpl-carousel__title').text()).toBe('Slide One')
  })

  it('has a live region with aria-live="polite"', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const liveRegion = wrapper.find('[aria-live="polite"]')
    expect(liveRegion.exists()).toBe(true)
  })

  it('each slide has role="group" and aria-roledescription="slide"', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    const slides = wrapper.findAll('[role="group"]')
    expect(slides).toHaveLength(3)
    expect(slides[0].attributes('aria-roledescription')).toBe('slide')
  })

  it('prev button has accessible label', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    expect(wrapper.find('.rpl-carousel__nav--prev').attributes('aria-label')).toBe('Previous slide')
  })

  it('next button has accessible label', () => {
    const wrapper = mount(RplCarousel, {
      props: { items: sampleItems }
    })
    expect(wrapper.find('.rpl-carousel__nav--next').attributes('aria-label')).toBe('Next slide')
  })
})
